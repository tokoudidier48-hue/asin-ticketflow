interface Ticket {
    id: number;
    titre: string;
    description: string;
    statut: "Nouveau" | "En cours" | "Résolu" | "Clôturé";
    priorite: "Basse" | "Moyenne" | "Haute" | "Critique";
}

const ticket: Ticket = {
    id: 1,
    titre: "Erreur de connexion",
    description: "L'utilisateur n'arrive pas à se connecter.",
    statut: "Nouveau",
    priorite: "Haute"
};

console.log(ticket);
console.log(ticket.titre);
console.log(ticket.statut);