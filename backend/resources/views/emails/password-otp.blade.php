<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Code de réinitialisation</title>
</head>
<body style="margin:0; padding:30px; background:#f4f7fb; font-family:Arial, Helvetica, sans-serif; color:#172033;">

    <div style="max-width:480px; margin:0 auto; padding:32px; background:#ffffff; border-radius:12px; border:1px solid #e5eaf1;">

        <h2 style="margin:0 0 8px; color:#173f8a;">ASIN TicketFlow</h2>

        <p style="margin:0 0 20px; color:#475467;">
            Vous avez demandé la réinitialisation de votre mot de passe.
            Voici votre code de vérification :
        </p>

        <div style="margin:0 0 20px; padding:18px; text-align:center; background:#eaf1ff; border-radius:10px; font-size:34px; font-weight:bold; letter-spacing:10px; color:#173f8a;">
            {{ $code }}
        </div>

        <p style="margin:0 0 12px; color:#475467; font-size:14px;">
            Ce code est valable <strong>{{ $minutes }} minutes</strong>.
        </p>

        <p style="margin:0; color:#98a2b3; font-size:12px;">
            Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail :
            votre mot de passe ne sera pas modifié.
        </p>

    </div>

</body>
</html>