<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PasswordResetController extends Controller
{
    private const OTP_MINUTES = 10;
    private const RESET_MINUTES = 15;
    private const MAX_ATTEMPTS = 5;

    /**
     * Étape 1 : envoi du code OTP par e-mail.
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($validated['email']));

        $user = User::where('email', $email)->first();

        if ($user) {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            DB::table('password_reset_otps')->updateOrInsert(
                ['email' => $email],
                [
                    'code_hash' => Hash::make($code),
                    'reset_token_hash' => null,
                    'attempts' => 0,
                    'expires_at' => now()->addMinutes(self::OTP_MINUTES),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            try {
                Mail::to($user->email)->send(
                    new PasswordResetOtpMail($code, self::OTP_MINUTES)
                );
            } catch (Throwable $e) {
                Log::error('Échec envoi e-mail OTP : ' . $e->getMessage());
            }
        }

        // Même réponse que le compte existe ou non
        return response()->json([
            'message' => 'Si cette adresse correspond à un compte, un code à 6 chiffres vient d’être envoyé.',
        ], 200);
    }

    /**
     * Étape 2 : vérification du code OTP.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'code' => ['required', 'digits:6'],
        ]);

        $email = strtolower(trim($validated['email']));

        $row = DB::table('password_reset_otps')->where('email', $email)->first();

        $invalid = response()->json([
            'message' => 'Code invalide ou expiré.',
        ], 422);

        if (
            !$row ||
            !$row->code_hash ||
            Carbon::parse($row->expires_at)->isPast() ||
            $row->attempts >= self::MAX_ATTEMPTS
        ) {
            return $invalid;
        }

        if (!Hash::check($validated['code'], $row->code_hash)) {
            DB::table('password_reset_otps')
                ->where('email', $email)
                ->increment('attempts');

            return $invalid;
        }

        // Code correct : on le rend inutilisable et on délivre un jeton temporaire
        $resetToken = Str::random(64);

        DB::table('password_reset_otps')
            ->where('email', $email)
            ->update([
                'code_hash' => null,
                'reset_token_hash' => hash('sha256', $resetToken),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(self::RESET_MINUTES),
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Code vérifié.',
            'reset_token' => $resetToken,
        ], 200);
    }

    /**
     * Étape 3 : définition du nouveau mot de passe.
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'reset_token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = strtolower(trim($validated['email']));

        $row = DB::table('password_reset_otps')->where('email', $email)->first();

        if (
            !$row ||
            !$row->reset_token_hash ||
            Carbon::parse($row->expires_at)->isPast() ||
            !hash_equals($row->reset_token_hash, hash('sha256', $validated['reset_token']))
        ) {
            return response()->json([
                'message' => 'La demande a expiré. Veuillez recommencer.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'La demande a expiré. Veuillez recommencer.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        // Déconnecte toutes les anciennes sessions
        $user->tokens()->delete();

        DB::table('password_reset_otps')->where('email', $email)->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ], 200);
    }
}