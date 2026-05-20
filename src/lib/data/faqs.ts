export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Comment Sourcey est différent d'Alibaba ou AliExpress ?",
    a: "Sur Alibaba, tu négocies seul, en anglais cassé, sans savoir si l'usine en face est sérieuse. Sur Sourcey, un humain francophone basé en Chine s'occupe de tout : il trouve la bonne usine, négocie le prix, va sur place vérifier, filme une vidéo QC avant expédition. Tu n'as qu'à choisir le produit.",
  },
  {
    q: "Je suis débutant, ce n'est pas pour les pros uniquement ?",
    a: "Justement non — on a conçu Sourcey pour deux publics. Si tu lances ton premier produit e-com, le plan Starter à 29€/mois est parfait pour des petites quantités (10 à 200 unités). Si tu fais déjà du gros volume, l'offre Entreprise te donne un agent 100% dédié.",
  },
  {
    q: "Quels sont les délais réels de livraison ?",
    a: "Comptez 7-12 jours entre l'expédition et la réception en France (vs 21+ jours avec AliExpress). Pour la production, ça dépend du produit : 5-15 jours en moyenne pour des produits sans personnalisation, jusqu'à 30 jours pour du sur-mesure.",
  },
  {
    q: "C'est quoi cette histoire de vidéo QC ?",
    a: "Avant chaque expédition, votre agent filme une vidéo de votre commande : ouverture des cartons, vérification d'un échantillon aléatoire, test du produit. C'est inclus dans les plans Pro et Entreprise, et c'est ce qui évite les mauvaises surprises à la réception.",
  },
  {
    q: "Comment se passe le paiement ? Vous gardez l'argent ?",
    a: "On utilise un système d'escrow : votre paiement est sécurisé chez nous jusqu'à ce que vous receviez et validiez votre commande. Si quelque chose ne va pas, vous êtes remboursé. Si tout est bon, on libère le paiement vers l'usine et l'agent.",
  },
  {
    q: "Puis-je connecter ma boutique Shopify ou WooCommerce ?",
    a: "Oui, l'intégration est native dans le plan Pro. Vous pouvez pousser un produit sourcé direct dans votre catalogue, avec la fiche générée par IA (titre, description SEO, variantes). Pour WordPress/WooCommerce on a un plugin officiel.",
  },
  {
    q: "Et la TVA et les frais de douane ?",
    a: "On gère toute la partie administrative : déclaration TVA EU, IOSS pour les envois < 150€, droits de douane le cas échéant. Pour l'offre Entreprise on gère même le stockage en entrepôt EU pour éviter les délais douaniers.",
  },
  {
    q: "Je peux annuler quand ?",
    a: "À tout moment, en 1 clic depuis ton compte. Aucun engagement. Si tu prends un plan annuel et tu annules, on rembourse au prorata.",
  },
];
