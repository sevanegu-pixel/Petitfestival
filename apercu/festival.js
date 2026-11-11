// Tout ce qui décrit le festival est ici. Les dates, heures et places des représentations
// se saisissent dans l'appli de gestion des réservations ; les textes et photos des spectacles sont plus bas.
window.FESTIVAL = {
  nom: "Le P’tit Festival au Théâtricul",
  nomCourt: "Le P’tit Festival",
  edition: "1re édition · cirque · danse · théâtre · musique · marionnette",
  dates: "Du 3 au 20 décembre 2026",
  lieu: "Théâtricul, Chêne-Bourg (Genève)",
  adresse: "Rue de Genève 64, 1225 Chêne-Bourg",
  site: "https://ptit-festival.ch",
  accroche: "Dix-huit jours de spectacles sur la petite scène du Théâtricul : cirque, théâtre, marionnette, musique, performance… Des artistes d'ici et d'ailleurs, des formes courtes et des grandes, et un cabaret pour finir.",
  presentation: [
    "Le P’tit Festival se vit au chaud. En entrant au Théâtricul, il y a la buvette et son poêle à bois : c'est là qu'on se retrouve, avant, entre et après les spectacles.",
    "On s'y pose avec un verre, le bon vieux vin qu'on attend d'une soirée au théâtre, et de quoi manger : des choses simples, mais bonnes. On discute avec les artistes qui sortent de scène, en attendant que la salle rouvre ses portes pour le spectacle suivant.",
    "Ici, la soirée ne s'arrête pas au salut final : elle continue au bord du poêle, dans un esprit convivial et festif. On vient pour un spectacle, on reste pour la soirée."
  ],
  // Ancienne section « Au coin du feu » : son texte est remonté dans la présentation (comme sur le dépliant)
  coinDuFeu: null,
  organisation: "Le festival est organisé par Sévane Gurunlian et Yvette Challande, avec l'équipe du Théâtricul.",
  // Hommage discret à Gérard Challande (bas de la page « Le festival », et une ligne au bas du programme)
  hommage: {
    sur: "En mémoire",
    titre: "Gérard Challande, 1939–2021",
    textes: [
      "Comédien, chanteur d'opérette, imprimeur et bâtisseur, Gérard Challande a transformé en 1979 une ancienne écurie de Chêne-Bourg en salle de spectacle : le Théâtricul, « petit théâtre » en roumain, inauguré avec *Le Roi se meurt* d'Ionesco. Dix ans plus tard, il fonde avec Yvette Challande le Théâtre-Cirqule, l'école de cirque de Genève.",
      "Il nous a quittés le 20 décembre 2021. Depuis, un cabaret lui rend hommage chaque année à cette date. Le P’tit Festival prolonge cette habitude : il se termine le 20 décembre, avec le cabaret du 19 et « Ma vie tout simplement » d'Yvette Challande, et donne la priorité aux jeunes compagnies, comme le Théâtricul l'a toujours fait."
    ],
    photo: "photos/gerard-roi-se-meurt.webp",
    legende: "Gérard Challande dans « Le Roi se meurt », 1981. Photo : archives Challande.",
    ligneProgramme: "Le P’tit Festival se tient en souvenir de Gérard Challande, fondateur du Théâtricul.",
    lienTexte: "Quelques mots sur lui"
  },
  theatricul: "Rue de Genève 64, 1225 Chêne-Bourg. Tram 12 ou 17, arrêt Peillonnex ; Léman Express, gare de Chêne-Bourg.",
  infos: [
    ["Tarifs", "Chaque spectacle a son tarif, indiqué sur sa fiche ; toute la recette revient aux artistes. Paiement sur place."],
    ["Réservations", "Réservez depuis la fiche de chaque spectacle. Vous recevez un e-mail de confirmation, et vos places vous attendent à l'entrée."],
    ["Sur place", "La buvette ouvre une heure avant le premier spectacle de la journée, avec de quoi boire et grignoter. Les portes de la salle ouvrent un quart d'heure avant chaque représentation."],
    ["Enfants", "Plusieurs spectacles sont pensés pour les familles ; l'âge conseillé est indiqué sur chaque fiche. Les tout-petits sont les bienvenus aux spectacles « dès 3 ans »."]
  ],
  acces: [
    ["Tram", "Tram 12 ou 17, arrêt Peillonnex : le théâtre est à deux minutes à pied."],
    ["Train", "Léman Express, gare de Chêne-Bourg, puis 7 minutes à pied par la rue de Genève."],
    ["Vélo", "Le théâtre est à deux pas de la Voie verte, qui longe le Léman Express de Genève à Annemasse."],
    ["Voiture", "Le stationnement dans le quartier est limité : privilégiez les transports publics. Parking public de la gare de Chêne-Bourg à 7 minutes."]
  ],
  carte: "https://www.google.com/maps?q=Th%C3%A9%C3%A2tricul%2C+Rue+de+Gen%C3%A8ve+64%2C+1225+Ch%C3%AAne-Bourg&z=16&output=embed",
  itineraire: "https://www.google.com/maps/dir/?api=1&destination=Th%C3%A9%C3%A2tricul%2C+Rue+de+Gen%C3%A8ve+64%2C+1225+Ch%C3%AAne-Bourg",
  contact: "petitfestival.ge@gmail.com",
  theatriculSite: "https://theatricul.net",
  // Adresse de l'application de réservation (Apps Script, se termine par /exec). Vide = « Le programme et les réservations ouvrent bientôt ».
  api: "https://script.google.com/macros/s/AKfycbwWdo5fOb68E1Civ7ToZe5EDYxvq_9GDl97nmEwv7aPYHtQn-vSN_uhZgsjmjZIrLph/exec"
};

// Fiches des spectacles. La clé = le titre tel qu'il est écrit dans l'appli de réservation (majuscules et accents sans importance).
// court = 1 à 2 phrases (programme) ; long = texte complet (fiche, derrière « Lire la suite »).
// photo = fichier dans photos/ (ou photos = liste [{ src, credit }] pour une galerie) ; banque = autres photos disponibles dans la galerie de l'appli, pas affichées ; tarif = texte si la feuille n'en donne pas ; videos = liste [{ url: YouTube/Vimeo }] ou [{ src: fichier .mp4, poster }].
window.SPECTACLES = {
  "Hurler sous l'eau": {
    photos: [
      { src: "photos/hurler-z3.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z2.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z7.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z8.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z4.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z6.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z1.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-z5.webp", credit: "Photo : Compagnie Sémaphore" }
    ],
    banque: [
      { src: "photos/hurler.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-2.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-3.webp", credit: "Photo : Compagnie Sémaphore" },
      { src: "photos/hurler-4.webp", credit: "Photo : Compagnie Sémaphore" }
    ],
    videos: [{ src: "videos/hurler.mp4", poster: "videos/hurler.webp", titre: "Extraits de la reprise à FriScènes, octobre 2026" }],
    photo: "photos/hurler-z3.webp",
    credit: "Photo : Compagnie Sémaphore",
    compagnie: "Compagnie Sémaphore",
    discipline: "Théâtre",
    duree: "55 min",
    age: "Ados et adultes",
    tarif: "Prix libre, 10 francs conseillés",
    court: "Hurler sous l'eau dit la colère : il la sonde, la pétrit et l'ausculte. Trois comédiennes jouent avec le curseur de la rage, avec humour et sensibilité.",
    long: "Hurler sous l'eau dit la colère. Il la sonde, la pétrit et l'ausculte sous tous ses aspects ; ce qu'elle fait au corps, à la voix, ce qui arrive quand on la tait ou au contraire quand elle déborde au dehors, au-delà de soi. C'est une exploration intime de la rage et une réappropriation de celle-ci, parce que, socialement, cette émotion a toujours été le lot des hommes.\n\nAvec Hurler sous l'eau, les trois comédiennes jouent avec le curseur de la colère, bousculant ses extrêmes avec humour et sensibilité pour présenter au public toute la beauté et la complexité de cette émotion que nous partageons toustes.\n\nHurler sous l'eau, ce n'est pas une histoire qui se raconte ni des personnages bien écrits que l'on suit tout au long du spectacle. C'est une position sociale et militante prise par trois jeunes femmes artistes polyvalentes. C'est un long cri, tantôt drôle, tantôt émouvant.\n\nCe cri est composé de différents tableaux et alterne monologues, dialogues, moments de chœur et de corps. Il dit la colère. Il la sonde, la pétrit et l'ausculte sous tous ses aspects : ce qu'elle fait au corps, à la voix, ce qui arrive quand on la tait ou au contraire quand elle déborde au dehors, au-delà de soi. C'est une exploration intime de la rage et une réappropriation de celle-ci, parce que, socialement, cette émotion a toujours été le lot des hommes. Les femmes, lorsqu'elles s'énervent, sont bien vite qualifiées d'hystériques et remises à leur place.\n\nAvec Hurler sous l'eau, nous jouons avec le curseur de la colère, bousculant ses extrêmes avec humour et sensibilité pour présenter au public toute la beauté et la complexité de cette émotion que nous partageons toutes et tous.\n\nLa création est née en 2025 au festival Emergence, puis a été reprise à FriScènes en octobre 2026 dans une version plus développée.",
    distribution: "De et avec Sarah Othenin-Girard, Emilie de Carvalho Ferreira et Zoé Spycher.",
    citation: "« Tant qu'il me reste ma voix, je continuerai. À crier, à crier, jusqu'à ce que le béton des murs se fissure. »"
  },
  "Mise à Mâle": {
    photos: [
      { src: "photos/mise-a-male-1.webp", credit: "Photo : Antonio Anguiano" },
      { src: "photos/mise-a-male.webp", credit: "Photo : Antonio Anguiano" },
      { src: "photos/mise-a-male-2.webp", credit: "Photo : Antonio Anguiano" },
      { src: "photos/mise-a-male-4.webp", credit: "Photo : Antonio Anguiano" },
      { src: "photos/mise-a-male-3.webp", credit: "Photo : Antonio Anguiano" }
    ],
    compagnie: "Antonio Anguiano",
    discipline: "Cirque et théâtre physique",
    duree: "30 min",
    age: "Ados et adultes",
    tarif: "Prix libre, 15 francs conseillés",
    court: "Un solo absurde, politique, tendre et brutal, au mât pendulaire, sur la masculinité et ce qu'elle fait aux corps.",
    long: "> En acceptant d'avoir dans mon corps des sensations que je ne voulais pas assimiler, je me suis rendu compte que je ne m'acceptais pas moi-même.\n> Lorsque j'ai accepté mes actions, j'ai commencé à me connecter et à accepter l'avalanche de sentiments que j'ai en moi.\n> J'étais une fleur mal arrosée. (Antonio Anguiano)\n\nMise à Mâle est un solo absurde, politique, tendre et brutal. Il parle de masculinité, de vulnérabilité, de santé mentale et d'identité, avec les outils de l'artiste multidisciplinaire : mât pendulaire, clown, danse, théâtre physique et objets crochetés.\n\nDes fleurs, une serpillière, la virilité, la chute, la renaissance : autant de symboles qu'Antonio Anguiano manipule, détourne et laisse tomber, pour voir ce qui reste d'un homme quand on lui enlève ce qu'on lui a appris.",
    distribution: "De et avec Antonio Anguiano."
  },
  "Pâtes au Ketchup": {
    photos: [
      { src: "photos/pates-ketchup-1.webp", credit: "Photo : Ana Clara Hauri" },
      { src: "photos/pates-ketchup-3.webp", credit: "Photo : Ana Clara Hauri" },
      { src: "photos/pates-ketchup-2.webp", credit: "Photo : Ana Clara Hauri" }
    ],
    compagnie: "Ana Clara Hauri",
    discipline: "Théâtre d'objet",
    duree: "40 min",
    age: "Ados et adultes",
    tarif: "Au chapeau",
    court: "Dans Pâtes au Ketchup, Clara Chupket retrace l'histoire de sa famille et de sa relation avec son père par le théâtre d'objet. Mais, au fil du spectacle, des imprévus viennent bouleverser le déroulement, l'entraînant dans un univers plus sanglant. Est-ce l'âme du père qui vient hanter le spectacle ?",
    long: "Dans *Pâtes au Ketchup*, Clara Chupket retrace l'histoire de sa famille et de sa relation avec son père par le théâtre d'objet. Mais, au fil du spectacle, des imprévus viennent bouleverser le déroulement, l'entraînant dans un univers plus sanglant. Est-ce l'âme du père qui vient hanter le spectacle ?\n\nEntre humour absurde, manipulation d'objets et mise en abyme, Clara Chupket nous embarque dans un spectacle aussi déjanté qu'imprévisible.\n\nVous avez aimé les films de Tarantino ? Venez voir ce spectacle ! Vous ne les avez pas aimés ? Venez quand même !",
    distribution: "De et avec Ana Clara Hauri, jeune artiste de cirque genevoise."
  },
  "Corde et cordes": {
    photos: [
      { src: "photos/corde-3.webp", credit: "Photo : Miguel Bueno" },
      { src: "photos/corde-1.webp", credit: "Photo : Miguel Bueno" },
      { src: "photos/corde-4.webp", credit: "Photo : Miguel Bueno" },
      { src: "photos/corde-2.webp", credit: "Photo : Miguel Bueno" }
    ],
    compagnie: "Léa Gase, Céline Martin et Benoît Gautier",
    discipline: "Cirque aérien et contrebasse",
    duree: "15 min",
    age: "Tout public",
    court: "Entre vertige et équilibre, nous avons tenté de tisser sur la corde un univers où l'absurde flirte avec la poésie. Le son grave de la contrebasse fera vibrer les personnages, peut-être même les emportera-t-il ailleurs ?",
    long: "Sur la corde, entre équilibre et vertige, nous avons tenté de tisser un univers où l'absurde flirte avec la poésie. Le son grave de la contrebasse fait trembler les personnages.\n\nEntre cours, vie professionnelle et vie de famille, c'est la passion du cirque qui nous a réunis. De cette rencontre improbable est née une création où l'irrationnel devient notre langage. Deux personnages, à la fois confus et complices, se perdent et se retrouvent dans un délire surréaliste. La musique et le musicien, avec ses cordes, les enveloppent.",
    distribution: "De et avec Léa Gase et Céline Martin. Accompagnement musical : Benoît Gautier."
  },
  "I.A Ma Chère": {
    photos: [
      { src: "photos/ia-ma-chere.webp", credit: "Photo : Jordan Fraser Emery" },
      { src: "photos/ia-ma-chere-2.webp", credit: "Photo : Jordan Fraser Emery" },
      { src: "photos/ia-ma-chere-3.webp", credit: "Photo : Jordan Fraser Emery" },
      { src: "photos/ia-ma-chere-4.webp", credit: "Photo : Jordan Fraser Emery" }
    ],
    videos: [{ url: "https://youtu.be/w1-ZoSAk0B4", titre: "Extrait vidéo" }],
    photo: "photos/ia-ma-chere.webp",
    credit: "Photo : Jordan Fraser Emery",
    compagnie: "Jordan Fraser Emery",
    discipline: "Performance et art numérique",
    duree: "15 min",
    age: "Tout public",
    tarif: "Au chapeau",
    court: "La réalité est devenue son propre avatar, dopée par des IA que nous nourrissons de nos gestes et de nos vécus. Seul face à trois caméras 360°, le performeur passe du travailleur du clic docile à la créature indomptable dans un court-circuit visuel et sonore de 15 minutes. Une performance coup de poing entre extraction de données et transe techno/noise.",
    long: "La réalité est devenue son propre avatar, dopée par des IA que nous nourrissons de nos gestes et de nos vécus. Seul face à trois caméras 360°, le performeur passe du travailleur du clic docile à la créature indomptable dans un court-circuit visuel et sonore de 15 minutes. Une performance coup de poing entre extraction de données et transe techno/noise.",
    distribution: "De et avec Jordan Fraser Emery, créateur et chercheur en création numérique."
  },
  "Les 12 lettres du facteur Cheval": {
    videos: [{ url: "https://www.youtube.com/watch?v=IHF0_6G28Qo", titre: "Les 12 lettres du facteur Cheval, en musique et en public" }],
    photos: [
      { src: "photos/facteur-cheval.webp", credit: "Photo : Les Enfants du Paradigme" },
      { src: "photos/facteur-cheval-3.webp", credit: "Photo : Les Enfants du Paradigme" },
      { src: "photos/facteur-cheval-6.webp", credit: "Photo : Les Enfants du Paradigme" },
      { src: "photos/facteur-cheval-2.webp", credit: "Photo : Les Enfants du Paradigme" },
      { src: "photos/facteur-cheval-4.webp", credit: "Photo : Les Enfants du Paradigme" },
      { src: "photos/facteur-cheval-5.webp", credit: "Photo : Les Enfants du Paradigme" }
    ],
    photo: "photos/facteur-cheval.webp",
    credit: "Photo : Les Enfants du Paradigme",
    compagnie: "Didier Hugon · Les Enfants du Paradigme",
    discipline: "Poème théâtral et musical",
    duree: "48 min",
    age: "Tout public",
    court: "Un comédien, sa brouette et son violon nous emmènent dans le pays onirique, et pourtant bien réel, du Palais idéal du facteur Cheval.",
    long: "Une brouette qui parle, c'est pas banal. Une brouette qui parle d'un Cheval, d'un palais, d'un facteur, c'est vraiment idéal pour donner une envie folle de se plonger sur les traces de Ferdinand Cheval, bâtisseur d'une œuvre originale, solide et fragile à la fois, comme un comédien sur une brouette avec son violon.\n\nNé en 1836 et facteur de son métier, Ferdinand Cheval a passé trente-trois ans à construire son Palais idéal, à Hauterives dans la Drôme, pour marquer son passage dans le temps et écrire avec du ciment la vision d'un rêve très personnel. Douze lettres racontent douze dates de sa vie. Comme un colporteur, le comédien nous fait voyager dans ce pays onirique et pourtant bien réel ; pas descriptif, ce poème théâtral et musical veut surtout donner envie d'aller voir… le palais.",
    distribution: "Écriture, jeu et musique : Didier Hugon. Mise en scène et écriture : Daniel Haspala. Composition : David Mathieu. Lutherie de brouette musicale : Marc Boutron. Costume : Maryline Gerbet."
  },
  "Hans l'Heureux": {
    photos: [
      { src: "photos/hans-visuel.webp", credit: "Visuel : Compagnie Étourderie" },
      { src: "photos/hans-visuel-2.webp", credit: "Affiche : Compagnie Étourderie" }
    ],
    banque: [
      { src: "photos/hans-affiche.webp", credit: "Affiche : Compagnie Étourderie" },
      { src: "photos/hans-boude.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-pepite.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-naissance.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-public.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-cheval.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-cochon-vache.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-2.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-3.webp", credit: "Photo : Compagnie Étourderie" },
      { src: "photos/hans-4.webp", credit: "Photo : Compagnie Étourderie" }
    ],
    photo: "photos/hans-visuel.webp",
    credit: "Visuel : Compagnie Étourderie",
    compagnie: "Compagnie Étourderie",
    discipline: "Marionnettes et conte",
    duree: "40 min",
    age: "Tout public dès 3 ans",
    tarif: "15 francs, prix unique",
    court: "Adaptation du conte traditionnel des frères Grimm. Vous ne ferez plus jamais votre lessive de la même manière ! Pimprenelle se fait surprendre par les habits qu'elle étend et se voit raconter, malgré elle, l'histoire de Hans l'Heureux.",
    long: "D'après le conte « Hans im Glück » des frères Grimm.\n\nPimprenelle vient étendre sa lessive sur scène mais tombe, très surprise, sur tout un public présent dans la salle. Elle interagit pour savoir ce que tous ces gens sont venus faire dans son espace buanderie. Après avoir compris qu'ils viennent pour écouter un spectacle, Pimprenelle négocie de pouvoir juste ranger son linge avant d'écouter, elle aussi, l'histoire. Au moment de retirer le linge de la corde, les habits font comme appel à elle. Ils s'animent. Pimprenelle se dit alors qu'elle pourrait elle-même raconter l'histoire de « Hans l'Heureux »…\n\nInspiré du travail de l'artiste Helga Stentzel, ce spectacle fait apparaître les animaux de l'histoire au travers des vêtements étendus sur la corde à linge. Il suscite ainsi, avec des matériaux communs, l'imagination et l'élan créatif des enfants.\n\nVenez découvrir ce conte traditionnel, revisité par le regard de Delphine Tschopp, assistée d'Amélie Chérubin Soulières à la mise en scène et d'Emilie Bender à la manipulation des marionnettes.\n\nLa Compagnie Étourderie crée des spectacles se produisant proche des gens, avec une volonté d'interaction avec le public. Les histoires sont présentées avec humour et sincérité et s'adressent aux tout petits comme aux tout grands.",
    distribution: "Écriture et jeu : Delphine Tschopp. Mise en scène : Amélie Chérubin Soulières. Manipulation des marionnettes : Emilie Bender. La compagnie fribourgeoise Étourderie était déjà au Théâtricul en décembre 2024 avec « Sur mon chemin, des pierres »."
  },
  "MERCALM": {
    photos: [
      { src: "photos/mercalm.webp", credit: "Photo : MERCALM" },
      { src: "photos/mercalm-2.webp", credit: "Photo : MERCALM, en Norvège" }
    ],
    videos: [{ url: "https://www.youtube.com/watch?v=aUMH9B6UjXo", titre: "Concert à la Brasserie du Mât, Genève" }],
    photo: "photos/mercalm.webp",
    credit: "Photo : MERCALM",
    compagnie: "Mona Creisson et Benoît Gautier",
    discipline: "Concert",
    duree: "45 min",
    age: "Tout public",
    tarif: "Au chapeau",
    court: "Un duo né en mer, en Bretagne. Violon alto, voix, basse électrique et effets : une musique paisible et mélancolique, entre jazz, traditions des côtes et échappées futuristes.",
    long: "MERCALM s'est formé en 2024, lors d'un voyage en voilier en Bretagne. Sa musique, paisible et mélancolique, évoque le crachin breton et le vol planant des oiseaux de mer. Elle mêle sonorités jazz, influences traditionnelles et explorations futuristes.\n\nLes deux marins rendent hommage aux gens de la mer et aux traditions musicales des côtes, en improvisant autour de chansons venues des ports où ils ont jeté l'ancre. Leur premier album, enregistré en novembre 2026, sortira au début de l'été 2027.",
    distribution: "Mona Creisson : violon alto, chant, effets. Benoît Gautier : basse électrique, effets."
  },
  "Ici sont les dragons": {
    photos: [
      { src: "photos/dragons.webp", credit: "Photo : Marc Chabourlin" },
      { src: "photos/dragons-2.webp", credit: "Photo : Circo Nagual" },
      { src: "photos/dragons-3.webp", credit: "Photo : Marc Chabourlin" },
      { src: "photos/dragons-4.webp", credit: "Photo : Circo Nagual" }
    ],
    photo: "photos/dragons.webp",
    credit: "Photo : Marc Chabourlin",
    compagnie: "Circo Nagual",
    discipline: "Solo de clown",
    duree: "45 min",
    age: "Tout public",
    tarif: "Au chapeau",
    court: "Abra, gardien des dragons de Terra Draconis, débarque sur Terre avec sa malle magique à la recherche de son ami l'Ornitoplexus. Un voyage clownesque pour renouer avec notre âme d'enfant.",
    long: "Un voyage clownesque pour renouer avec notre âme d'enfant. Le titre vient d'une ancienne coutume des cartographes : sur les cartes de navigation d'antan, « Ici sont les dragons » signalait les terres inexplorées, un avertissement énigmatique qui invitait aussi à l'aventure.\n\n« Avez-vous déjà rencontré mon ami incroyable, l'Ornitoplexus ? Il est grand, énorme, magnifique… du moins, je crois ! Vous voyez, j'ai un léger oubli, mais il reste très cher à mon cœur. Pouvez-vous m'aider à le retrouver ? »\n\nAbra, clown venu de Terra Draconis, la planète des dragons, débarque sur Terre avec sa malle magique en quête de son ami disparu, qui a laissé quelques pistes. L'imagination des humains est la clé du mystère : Abra arrivera-t-il à réveiller son dragon intérieur ? Au fil du spectacle, il nous rappelle avec une douceur poétique qu'un adulte créatif est simplement un enfant qui a survécu.\n\nŒufs de dragon en céramique, cartographie à l'aquarelle, bois de cerf, plumes et coquillages : le spectacle mêle l'art du clown et les arts plastiques pour faire naître une planète entière sur la scène.",
    distribution: "De et avec Jabber Daniel Bonfil. Regards extérieurs : Marie Broche et Clara Aumann. Costumes : Pascale Nedjar de Roma. Illustrations : Jonas Duvergé. Production déléguée : Pahaska Production. Circo Nagual est une compagnie franco-mexicaine installée dans le Gard, nourrie des contes, de la mythologie et des savoirs du Mexique."
  },
  "Ma vie tout simplement": {
    photos: [
      { src: "photos/ma-vie-2.webp", credit: "Photo : DR" },
      { src: "photos/ma-vie-3.webp", credit: "Photo : DR" },
      { src: "photos/ma-vie-1.webp", credit: "Photo : DR" }
    ],
    banque: [
      { src: "photos/ma-vie-affiche.webp", credit: "Affiche du spectacle" },
      { src: "photos/gerard-1.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-2.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-3.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-4.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-5.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-6.webp", credit: "Dessin : Gérard Challande" },
      { src: "photos/gerard-7.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-8.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-9.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-10.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-11.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-12.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-13.webp", credit: "Photo : archives Challande" },
      { src: "photos/gerard-14.webp", credit: "Photo : archives Challande" }
    ],
    photo: "photos/ma-vie-2.webp",
    credit: "Photo : DR",
    compagnie: "Yvette Challande",
    discipline: "Théâtre · seule en scène",
    age: "Ados et adultes",
    tarif: "Entrée libre",
    court: "Petite-fille de chiffonnier, fille de récupérateur, Yvette Challande évoque avec un humour sarcastique et légèrement féministe des moments de sa vie qui sortent de l'ordinaire. En hommage à Gérard Challande.",
    long: "Petite-fille de chiffonnier, fille de récupérateur, elle aurait pu être agent de traitement des déchets si elle n'avait pas préféré se lancer dans la vie artistique.\n\nDans son spectacle, la comédienne évoque avec un humour sarcastique et légèrement féministe des moments de sa vie qui sortent de l'ordinaire… Une famille italienne au passé un peu trouble… Une enfance dans l'entreprise de récupération familiale lui offre un terrain de jeu et d'aventures où l'imaginaire est roi… Mais l'argent rare…\n\n« Si tu es sage, tu auras un homme… mais si tu n'es pas sage, tu en auras plusieurs », lui avait dit son père. Alors, elle a choisi de ne pas être sage…\n\n« J'ai rencontré une vraie femme », lui a dit son ex-mari, et depuis elle se pose cette question : c'est quoi, une vraie femme ? Elle tente de le trouver en devenant femme au foyer, femme soumise, dominatrice, coquette, etc.\n\nElle vous parlera aussi de son deuxième mari qui est, à lui seul, tout un programme.",
    distribution: "De et par Yvette Challande, en hommage à Gérard Challande. Technique : Christine Demaeyer."
  },
  "Sur le rivage de Gaza": {
    photos: [{ src: "photos/gaza-plage.webp", credit: "Visuel : Plage de Gaza" }],
    banque: [{ src: "photos/gaza-affiche.webp", credit: "Affiche du spectacle" }],
    photo: "photos/gaza-plage.webp",
    credit: "Visuel : Plage de Gaza",
    compagnie: "Maulde Coutau, Nicolas Reichel et Thomas Delclaud",
    discipline: "Poésie palestinienne",
    age: "Ados et adultes",
    tarif: "25 francs (tarif réduit 20 francs)",
    court: "Une soirée de poésie palestinienne, portée par une comédienne, un comédien et un musicien.",
    distribution: "Avec Maulde Coutau, Nicolas Reichel et Thomas Delclaud. Lumière : Martin Leu. Décor : Mani Berclaz."
  },
  "Acrobaties littéraires": {
    lien: "https://www.rising.tf/raphael-perrenoud-auteur",
    lienTitre: "Le site d'auteur de Raphaël Perrenoud",
    photos: [
      { src: "photos/partir-a.webp", credit: "Photo : DR" },
      { src: "photos/partir-b.webp", credit: "Photo : DR" },
      { src: "photos/partir-c.webp", credit: "Photo : DR" },
      { src: "photos/partir-d.webp", credit: "Photo : DR" },
      { src: "photos/partir-e.webp", credit: "Photo : DR" },
      { src: "photos/partir-f.webp", credit: "Photo : DR" },
      { src: "photos/partir-g.webp", credit: "Photo : @chacaldelsuroficial" },
      { src: "photos/partir-2.webp", credit: "Couverture du livre « Lettres de gares et trains »" }
    ],
    videos: [{ url: "https://www.youtube.com/watch?v=DcJm8XQge4M", titre: "Teaser du spectacle" }],
    compagnie: "Compagnie Ceux qui boivent du thé",
    discipline: "Danse · acrobatie · roue Cyr",
    duree: "1 h 30 (toute la soirée)",
    tarif: "20 francs (réduit 15) · billet + livre 40 francs (réduit 35), au lieu de 26 francs pour le livre seul",
    court: "Le temps de repartir, de tirer les leçons, de se jeter à l'eau ; attraper le train en marche, monter sur le toit. Après, il sera trop tard. Une pièce acrobatique et dansée sur l'élan nomade, suivie de la présentation du livre « Lettres de gares et trains ».",
    long: "« Le temps de repartir, de tirer les leçons, de se jeter à l'eau ; attraper le train en marche, monter sur le toit. Après, il sera trop tard. »\n\nC'est l'histoire de trajectoires tangentes et d'une trop courte rencontre. Une question de rails, aussi. Par le mouvement acrobatique et dansé, « Partir vers l'est » rend hommage à l'élan nomade, aux premiers pas, au non-retour.\n\nLa pièce de Yuridia Ortega et Raphaël Perrenoud surgit de la convergence de leurs pratiques respectives : danse contemporaine, acrobatie au sol et roue Cyr. La chorégraphie s'est construite autour de la « désacrobatisation » d'un numéro de cirque ainsi que des exils répétés de ses auteurs hors de l'espace Schengen, particulièrement dans les Balkans.\n\nÀ l'occasion de la sortie du livre de Raphaël Perrenoud et Man Nien Lam « Lettres de gares et trains », dont certains textes ont directement inspiré la pièce, deux soirées mêlent littérature et spectacle, en collaboration avec la Société Genevoise des Écrivaines et Écrivains. La soirée s'ouvre sur une courte lecture de textes et de poésie, mise en lumière, par des membres de la Société ; vient ensuite le spectacle, puis la présentation des artistes et du livre. Durée de la soirée : 1 h 30.\n\nCes deux soirs, une table de livres de différent·es auteur·es de la Société Genevoise des Écrivaines et Écrivains est proposée à la vente sur place.",
    distribution: "Conception et interprétation : Yuridia Ortega et Raphaël Perrenoud. Compagnie Ceux qui boivent du thé. Livre « Lettres de gares et trains » de Raphaël Perrenoud et Man Nien Lam, présenté avec la Société Genevoise des Écrivaines et Écrivains."
  },
  "El Cabaret du festival": {
    discipline: "Cabaret",
    court: "La soirée de clôture : une suite de numéros d'une dizaine de minutes, de tous les genres, pour finir le festival en beauté."
  },
  "À la recherche du sourire perdu": {
    compagnie: "Formation artistique du Théâtre-Cirqule",
    discipline: "Cirque",
    photos: [{ src: "photos/sourire-perdu.webp", credit: "Illustration : Yvette Challande" }],
    court: "Il était une fois un pays étrange où le sourire n'existait pas. Jamais on n'entendait le moindre rire, même les enfants ne savaient pas chanter, ni danser… La Reine était triste et tout le royaume devait être comme elle… Sa fille était capricieuse. Mais un jour, une vieille femme…"
  },
  "C'est quoi ce cirque": {
    photos: [
      { src: "photos/cest-quoi-1.webp", credit: "Photo : DR" },
      { src: "photos/cest-quoi-2.webp", credit: "Floriza Flor · Photo : DR" }
    ],
    compagnie: "Floriza Flor",
    duree: "30 min",
    tarif: "Au chapeau",
    distribution: "De et avec Floriza Flor, seule en scène.",
    court: "Floriza Flor retrace, raconte et rend hommage à des extraits du roman autobiographique d'Yvette Challande, « C'est quoi ce cirque ». Avec une touche d'humour et de sensibilité, sur des airs de Johnny Hallyday, et un clin d'œil à Gérard Challande."
  }
};

// Programme d'essai (essai 9, 9 nov. 2026) affiché seulement dans l'aperçu (/apercu/), pour les dates pas encore ouvertes dans l'appli. Sans réservation.
window.PROGRAMME_ESSAI = [
  ["2026-12-03", "20:00", "Ma vie tout simplement"],
  ["2026-12-04", "19:45", "Hurler sous l'eau"],
  ["2026-12-04", "21:00", "C'est quoi ce cirque"],
  ["2026-12-05", "18:00", "Hurler sous l'eau"],
  ["2026-12-05", "19:30", "Mise à Mâle"],
  ["2026-12-05", "20:30", "Pâtes au Ketchup"],
  ["2026-12-06", "16:00", "I.A Ma Chère"],
  ["2026-12-06", "18:00", "Mise à Mâle"],
  ["2026-12-06", "19:00", "MERCALM"],
  ["2026-12-10", "17:45", "Pâtes au Ketchup"],
  ["2026-12-10", "18:35", "I.A Ma Chère"],
  ["2026-12-10", "20:00", "Les 12 lettres du facteur Cheval"],
  ["2026-12-11", "18:00", "Hans l'Heureux"],
  ["2026-12-11", "18:55", "Corde et cordes"],
  ["2026-12-11", "20:00", "Les 12 lettres du facteur Cheval"],
  ["2026-12-12", "17:00", "Ici sont les dragons"],
  ["2026-12-12", "20:00", "À la recherche du sourire perdu"],
  ["2026-12-13", "15:00", "À la recherche du sourire perdu"],
  ["2026-12-15", "20:00", "Sur le rivage de Gaza"],
  ["2026-12-16", "19:30", "Acrobaties littéraires"],
  ["2026-12-17", "19:30", "Acrobaties littéraires"],
  ["2026-12-18", "20:00", "Sur le rivage de Gaza"],
  ["2026-12-19", "17:00", "Ici sont les dragons"],
  ["2026-12-19", "18:00", "Corde et cordes"],
  ["2026-12-19", "20:00", "El Cabaret du festival"],
  ["2026-12-20", "17:00", "Ma vie tout simplement"]
];
