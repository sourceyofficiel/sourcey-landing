export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  result: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marie Dubois",
    role: "Fondatrice, Maison Lila",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    quote:
      "Sourcey a transformé mon e-commerce. Mon agent Chen Mei comprend exactement ce que je veux, négocie pour moi, et m'envoie une vidéo QC avant chaque expédition.",
    result: "+38% de marge sur mon best-seller",
  },
  {
    id: "2",
    name: "Thomas Lefèvre",
    role: "CEO, Atelier Nord",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    quote:
      "J'ai passé 2 ans à galérer avec Alibaba. En 3 semaines avec Sourcey, j'avais ma première commande livrée. La différence c'est l'humain derrière, point.",
    result: "Délai divisé par 2 vs Alibaba",
  },
  {
    id: "3",
    name: "Sophie Renaud",
    role: "DTC Manager, Botanik",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    quote:
      "Le plan Pro est rentabilisé dès la première commande. Les fiches produits générées par l'IA passent direct sur Shopify, on gagne un temps fou.",
    result: "12h/semaine économisées",
  },
];
