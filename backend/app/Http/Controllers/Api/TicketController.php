<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Récupérer tous les tickets
     */
    public function index()
    {
        $tickets = Ticket::query()
            ->latest()
            ->get();

        return response()->json($tickets, 200);
    }


    /**
     * Créer un ticket
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'statut' => ['nullable', 'in:Nouveau,En cours,Résolu,Clôturé'],
            'priorite' => ['nullable', 'in:Basse,Moyenne,Haute,Critique'],
        ]);

        $ticket = Ticket::create([
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'statut' => $validated['statut'] ?? 'Nouveau',
            'priorite' => $validated['priorite'] ?? 'Moyenne',
        ]);

        /*
         * On récupère le ticket fraîchement enregistré
         * afin de retourner les données complètes
         * au frontend Angular.
         */
        $ticket->refresh();

        return response()->json($ticket, 201);
    }


    /**
     * Récupérer un ticket
     */
    public function show(Ticket $ticket)
    {
        return response()->json($ticket, 200);
    }


    /**
     * Modifier un ticket
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'titre' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'statut' => [
                'sometimes',
                'required',
                'in:Nouveau,En cours,Résolu,Clôturé'
            ],
            'priorite' => [
                'sometimes',
                'required',
                'in:Basse,Moyenne,Haute,Critique'
            ],
        ]);

        $ticket->update($validated);

        $ticket->refresh();

        return response()->json($ticket, 200);
    }


    /**
     * Supprimer un ticket
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket supprimé avec succès.'
        ], 200);
    }
}