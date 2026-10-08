<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_ticket_peut_etre_cree(): void
    {
        $response = $this->postJson('/api/tickets', [
            'titre' => 'Ticket de test',
            'description' => 'Description du ticket de test',
            'statut' => 'Nouveau',
            'priorite' => 'Haute',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonFragment([
                'titre' => 'Ticket de test',
                'statut' => 'Nouveau',
                'priorite' => 'Haute',
            ]);

        $this->assertDatabaseHas('tickets', [
            'titre' => 'Ticket de test',
            'description' => 'Description du ticket de test',
        ]);
    }
}