// Tout ce qui décrit le festival est ici. Les dates, heures et places des représentations
// se saisissent dans l'appli de gestion des réservations ; les textes et photos des spectacles sont plus bas.
window.FESTIVAL = {
  nom: "Le Petit Festival au Théâtricul",
  nomCourt: "Le Petit Festival",
  edition: "1re édition · cirque · danse · théâtre · musique",
  dates: "Du 3 au 20 décembre 2026",
  lieu: "Théâtricul, Chêne-Bourg (Genève)",
  adresse: "Rue de Genève 64, 1225 Chêne-Bourg",
  site: "https://petit-festival.ch",
  accroche: "Dix-huit jours de spectacles sur la petite scène du Théâtricul : cirque, théâtre, marionnette, musique, performance… Des artistes d'ici et d'ailleurs, des formes courtes et des grandes, et un cabaret pour finir.",
  presentation: [
    "Le Théâtricul ouvre ses portes aux artistes de toutes les disciplines qui peuvent se produire sur sa petite scène : artistes professionnel·les, en voie de professionnalisation et élèves des écoles d'arts, sans limite d'âge. Le Petit Festival veut mettre en lumière et propulser leurs projets, avec une programmation éclectique et ouverte à tous les genres.",
    "Au programme : des petits formats de 15 à 35 minutes, des grands formats jusqu'à une heure, et un cabaret où chaque numéro dure une dizaine de minutes. Plusieurs spectacles se jouent le même soir, le temps de boire un verre à la buvette entre deux.",
    "La salle est petite, et c'est ce qui fait son charme : 45 à 50 places sur des bancs en gradin, à quelques mètres de la scène. Chaque spectacle a son tarif, parfois au chapeau, et toute la recette va aux artistes."
  ],
  organisation: "Le festival est organisé par Sévane Gurunlian et Yvette Challande, avec l'équipe du Théâtricul.",
  theatricul: "Un petit théâtre insolite et charmant, niché au 64 rue de Genève à Chêne-Bourg, qui accueille depuis des années les compagnies émergentes des arts vivants. Une scène de 5 mètres sur 5, une cour et un petit jardin.",
  infos: [
    ["Tarifs", "Chaque spectacle a son tarif, indiqué sur sa fiche ; certains sont au chapeau. Toute la recette revient aux artistes. Paiement sur place."],
    ["Réservations", "La salle compte 45 à 50 places : réservez depuis la fiche de chaque spectacle. Vous recevez un e-mail de confirmation, et vos places vous attendent à l'entrée."],
    ["Sur place", "La buvette ouvre une heure avant le premier spectacle de la journée, avec de quoi boire et grignoter. Les portes de la salle ouvrent un quart d'heure avant chaque représentation."],
    ["Enfants", "Plusieurs spectacles sont pensés pour les familles ; l'âge conseillé est indiqué sur chaque fiche. Les tout-petits sont les bienvenus aux spectacles « dès 3 ans »."]
  ],
  acces: [
    ["Tram et bus", "Tram 12 ou bus 61, arrêt Peillonnex : le théâtre est à deux minutes à pied."],
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
// court = 1 à 2 phrases (programme) ; long = texte complet (fiche, derrière « Lire la suite ») ; photo = fichier dans photos/.
window.SPECTACLES = {
  "Hurler sous l'eau": {
    compagnie: "Compagnie Sémaphore",
    discipline: "Théâtre",
    duree: "55 min",
    age: "Ados et adultes",
    court: "Trois jeunes femmes prennent la parole, et la colère avec. Un long cri, tantôt drôle, tantôt émouvant, en monologues, dialogues et moments de chœur.",
    long: "Hurler sous l'eau, ce n'est pas une histoire qui se raconte ni des personnages bien écrits que l'on suit tout au long du spectacle. C'est une position sociale et militante prise par trois jeunes femmes artistes polyvalentes. C'est un long cri, tantôt drôle, tantôt émouvant.\n\nCe cri est composé de différents tableaux et alterne monologues, dialogues, moments de chœur et de corps. Il dit la colère. Il la sonde, la pétrit et l'ausculte sous tous ses aspects : ce qu'elle fait au corps, à la voix, ce qui arrive quand on la tait ou au contraire quand elle déborde au dehors, au-delà de soi. C'est une exploration intime de la rage et une réappropriation de celle-ci, parce que, socialement, cette émotion a toujours été le lot des hommes. Les femmes, lorsqu'elles s'énervent, sont bien vite qualifiées d'hystériques et remises à leur place.\n\nAvec Hurler sous l'eau, nous jouons avec le curseur de la colère, bousculant ses extrêmes avec humour et sensibilité pour présenter au public toute la beauté et la complexité de cette émotion que nous partageons toutes et tous.\n\nLa création est née en 2025 au festival Emergence, puis a été reprise à FriScènes en octobre 2026 dans une version plus développée.",
    distribution: "De et avec Sarah Othenin-Girard, Emilie de Carvalho Ferreira et Zoé Spycher.",
    citation: "« Tant qu'il me reste ma voix, je continuerai. À crier, à crier, jusqu'à ce que le béton des murs se fissure. »"
  },
  "L'Invitation": {
    compagnie: "Julian Bellini",
    discipline: "Théâtre et jonglage",
    duree: "20 min",
    age: "Tout public",
    court: "Un duo théâtral joué avec un·e volontaire du public, qui lit les didascalies et sa part du dialogue. L'artiste répond, et ponctue la mini-pièce de moments jonglés.",
    long: "Tentative de jouer un duo théâtral avec un·e bénévole du public, qui lit les didascalies et sa part du dialogue. L'artiste répond et ponctue la mini-pièce de moments jonglés. Une forme courte, fragile et joueuse, où personne ne sait tout à fait ce qui va se passer.",
    distribution: "De et avec Julian Bellini, artiste de cirque et performeur formé au Théâtre-Cirqule."
  },
  "Mise à Mâle": {
    compagnie: "Antonio Anguiano",
    discipline: "Cirque et théâtre physique",
    duree: "40 min",
    age: "Ados et adultes",
    court: "Un solo absurde, politique, tendre et brutal, au mât pendulaire, sur la masculinité et ce qu'elle fait aux corps.",
    long: "Mise à Mâle est un solo absurde, politique, tendre et brutal. Il parle de masculinité, de vulnérabilité, de santé mentale et d'identité, avec les outils de l'artiste multidisciplinaire : mât pendulaire, clown, danse, théâtre physique et objets crochetés.\n\nDes fleurs, une serpillière, la virilité, la chute, la renaissance : autant de symboles qu'Antonio Anguiano manipule, détourne et laisse tomber, pour voir ce qui reste d'un homme quand on lui enlève ce qu'on lui a appris.",
    distribution: "De et avec Antonio Anguiano."
  },
  "Pâtes au Ketchup": {
    compagnie: "Ana Clara Hauri",
    discipline: "Théâtre d'objet",
    duree: "40 min",
    age: "Ados et adultes",
    court: "Une artiste présente sa famille et sa relation avec son père, drôle et loufoque. Jusqu'à ce que des imprévus fassent basculer le spectacle dans un univers plus sanglant.",
    long: "Pâtes au ketchup est un spectacle drôle et loufoque de théâtre d'objet, où une artiste présente sa famille et sa relation avec son père. Mais, au fil du spectacle, des imprévus viennent bouleverser le déroulement, l'amenant dans un univers plus sanglant. Est-ce l'âme du père qui vient hanter le spectacle ?",
    distribution: "De et avec Ana Clara Hauri, jeune artiste de cirque genevoise."
  },
  "Corde et cordes": {
    compagnie: "Léa Gase, Céline Martin et Benoît Gautier",
    discipline: "Cirque aérien et contrebasse",
    duree: "15 min",
    age: "Tout public",
    court: "Deux artistes de corde aérienne et un contrebassiste : entre équilibre et vertige, l'absurde flirte avec la poésie.",
    long: "Sur la corde, entre équilibre et vertige, nous avons tenté de tisser un univers où l'absurde flirte avec la poésie. Le son grave de la contrebasse fait trembler les personnages.\n\nEntre cours, vie professionnelle et vie de famille, c'est la passion du cirque qui nous a réunis. De cette rencontre improbable est née une création où l'irrationnel devient notre langage. Deux personnages, à la fois confus et complices, se perdent et se retrouvent dans un délire surréaliste. La musique et le musicien, avec ses cordes, les enveloppent.",
    distribution: "De et avec Léa Gase et Céline Martin. Accompagnement musical : Benoît Gautier."
  },
  "I.A Ma Chère": {
    compagnie: "Jordan Fraser Emery",
    discipline: "Performance et art numérique",
    duree: "15 min",
    age: "Tout public",
    court: "Au centre de trois caméras 360°, un performeur joue avec une intelligence artificielle projetée devant le public, jusqu'à se rendre invisible pour la perturber.",
    long: "Au centre de trois caméras 360° connectées, le performeur joue avec une intelligence artificielle projetée pour le public, et questionne notre usage de ce nouvel outil numérique.\n\nD'abord, l'IA transforme son corps en avatar 3D et l'oblige à des actions de plus en plus sportives pour récupérer des données. Puis, par un rituel chamanique et punk, il se rend invisible aux caméras pour la perturber. Une version de la pièce a été produite à Séoul.",
    distribution: "De et avec Jordan Fraser Emery, créateur et chercheur en création numérique.",
    video: "https://youtu.be/w1-ZoSAk0B4"
  },
  "Les 12 lettres du facteur Cheval": {
    compagnie: "Didier Hugon · Les Enfants du Paradigme",
    discipline: "Poème théâtral et musical",
    duree: "48 min",
    age: "Tout public",
    court: "Un comédien, sa brouette et son violon nous emmènent dans le pays onirique, et pourtant bien réel, du Palais idéal du facteur Cheval.",
    long: "Une brouette qui parle, c'est pas banal. Une brouette qui parle d'un Cheval, d'un palais, d'un facteur, c'est vraiment idéal pour donner une envie folle de se plonger sur les traces de Ferdinand Cheval, bâtisseur d'une œuvre originale, solide et fragile à la fois, comme un comédien sur une brouette avec son violon.\n\nNé en 1836 et facteur de son métier, Ferdinand Cheval a passé trente-trois ans à construire son Palais idéal, à Hauterives dans la Drôme, pour marquer son passage dans le temps et écrire avec du ciment la vision d'un rêve très personnel. Douze lettres racontent douze dates de sa vie. Comme un colporteur, le comédien nous fait voyager dans ce pays onirique et pourtant bien réel ; pas descriptif, ce poème théâtral et musical veut surtout donner envie d'aller voir… le palais.",
    distribution: "Écriture, jeu et musique : Didier Hugon. Mise en scène et écriture : Daniel Haspala. Composition : David Mathieu. Lutherie de brouette musicale : Marc Boutron. Costume : Maryline Gerbet."
  },
  "Hans l'Heureux": {
    compagnie: "Compagnie Etourderie",
    discipline: "Marionnette et théâtre",
    duree: "40 min",
    age: "Dès 3 ans, en famille",
    court: "Pimprenelle vient étendre sa lessive et découvre un public dans sa buanderie. Alors elle raconte, avec un bout de tissu et les animaux qui apparaissent sur la corde à linge, l'histoire de Hans l'Heureux.",
    long: "D'après le conte des frères Grimm « Hans im Glück ».\n\nPimprenelle vient étendre sa lessive sur scène et tombe, très surprise, sur tout un public présent dans la salle. Après avoir compris qu'ils viennent écouter un spectacle, elle négocie de pouvoir juste ranger son linge avant d'écouter, elle aussi, l'histoire. Mais au moment de retirer le linge de la corde, les habits s'animent. Pimprenelle se dit alors qu'elle pourrait elle-même raconter l'histoire de Hans l'Heureux. Elle fabrique une marionnette avec un bout de tissu : c'est Hans !\n\nLes animaux de l'histoire apparaissent sur la corde à linge, et Hans traverse toutes les péripéties du conte en y mettant son grain de sel : il échange son lingot d'or, reçu pour ses sept bonnes années de travail, contre un cheval, puis une vache, puis un cochon, puis une oie… qu'il finit par relâcher, préférant la savoir libre et heureuse. Hans n'est pas juste chanceux : il est heureux, glücklich.\n\nAvec des matériaux de tous les jours, le spectacle suscite l'imagination et l'élan créatif des enfants. L'idée des tissus sur une corde à linge vient du travail de l'artiste Helga Stentzel.",
    distribution: "Écriture et jeu : Delphine Tschopp. Regard extérieur : Amélie Chérubin Soulières. Conseil marionnettique : Émilie Bender. La compagnie fribourgeoise Etourderie joue pour le tout public depuis huit ans ; elle était déjà au Théâtricul en décembre 2024 avec « Sur mon chemin, des pierres »."
  },
  "MERCALM": {
    compagnie: "Mona Creisson et Benoît Gautier",
    discipline: "Concert",
    duree: "45 min",
    age: "Tout public",
    court: "Un duo né en mer, en Bretagne. Violon alto, voix, basse électrique et effets : une musique paisible et mélancolique, entre jazz, traditions des côtes et échappées futuristes.",
    long: "MERCALM s'est formé en 2024, lors d'un voyage en voilier en Bretagne. Sa musique, paisible et mélancolique, évoque le crachin breton et le vol planant des oiseaux de mer. Elle mêle sonorités jazz, influences traditionnelles et explorations futuristes.\n\nLes deux marins rendent hommage aux gens de la mer et aux traditions musicales des côtes, en improvisant autour de chansons venues des ports où ils ont jeté l'ancre. Leur premier album, enregistré en novembre 2026, sortira au début de l'été 2027.",
    distribution: "Mona Creisson : violon alto, chant, effets. Benoît Gautier : basse électrique, effets."
  },
  "Ici sont les dragons": {
    compagnie: "Circo Nagual",
    discipline: "Clown",
    duree: "45 min",
    age: "Dès 5 ans, en famille",
    court: "Abra, gardien des dragons de Terra Draconis, débarque sur Terre avec sa malle magique à la recherche de son ami l'Ornitoplexus. Un voyage clownesque pour renouer avec notre âme d'enfant.",
    long: "Un voyage clownesque pour renouer avec notre âme d'enfant. Le titre vient d'une ancienne coutume des cartographes : sur les cartes de navigation d'antan, « Ici sont les dragons » signalait les terres inexplorées, un avertissement énigmatique qui invitait aussi à l'aventure.\n\n« Avez-vous déjà rencontré mon ami incroyable, l'Ornitoplexus ? Il est grand, énorme, magnifique… du moins, je crois ! Vous voyez, j'ai un léger oubli, mais il reste très cher à mon cœur. Pouvez-vous m'aider à le retrouver ? »\n\nAbra, clown venu de Terra Draconis, la planète des dragons, débarque sur Terre avec sa malle magique en quête de son ami disparu, qui a laissé quelques pistes. L'imagination des humains est la clé du mystère : Abra arrivera-t-il à réveiller son dragon intérieur ? Au fil du spectacle, il nous rappelle avec une douceur poétique qu'un adulte créatif est simplement un enfant qui a survécu.\n\nŒufs de dragon en céramique, cartographie à l'aquarelle, bois de cerf, plumes et coquillages : le spectacle mêle l'art du clown et les arts plastiques pour faire naître une planète entière sur la scène.",
    distribution: "De et avec Jabber Daniel Bonfil. Regards extérieurs : Marie Broche et Clara Aumann. Costumes : Pascale Nedjar de Roma. Illustrations : Jonas Duvergé. Circo Nagual est une compagnie franco-mexicaine installée dans le Gard, nourrie des contes, de la mythologie et des savoirs du Mexique."
  },
  "Ma vie tout simplement": { discipline: "Théâtre" },
  "Sur le rivage de Gaza": { discipline: "Théâtre" },
  "Partir vers l'est": { discipline: "Théâtre" },
  "El Cabaret du festival": {
    discipline: "Cabaret",
    court: "La soirée de clôture : des numéros d'une dizaine de minutes, de tous les genres, par les artistes du festival et leurs invité·es."
  },
  "Formation artistique": { discipline: "Rencontre" }
};
