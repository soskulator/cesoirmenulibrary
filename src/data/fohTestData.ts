// FoH Test_beta - Front of House Test Questions
// Questions extracted from the official Ce Soir Front of House Test

export interface FohTestQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  correctIndex?: number; // For multiple choice questions
  category: 'service' | 'menu' | 'drinks' | 'operations' | 'general';
}

export const fohTestQuestions: FohTestQuestion[] = [
  // Service & Operations Questions
  {
    id: 1,
    question: "How long should it take to greet a table after they are seated?",
    type: 'multiple_choice',
    options: [
      "Less than 3 Minutes",
      "Less than 2 Minutes",
      "Within 1 minute"
    ],
    correctAnswer: "Within 1 minute",
    correctIndex: 2,
    category: 'service'
  },
  {
    id: 2,
    question: "What is Ce Soir's address?",
    type: 'short_answer',
    correctAnswer: "492 Bayfront Place",
    category: 'general'
  },
  {
    id: 3,
    question: "When should you notify a manager about an issue with a table?",
    type: 'multiple_choice',
    options: [
      "Only if the guest asks for a manager",
      "Only when food is sent back",
      "Anytime the guest is unhappy or something goes wrong"
    ],
    correctAnswer: "Anytime the guest is unhappy or something goes wrong",
    correctIndex: 2,
    category: 'service'
  },
  {
    id: 4,
    question: "How do you explain a dish if a guest asks you a question you don't know the answer to?",
    type: 'multiple_choice',
    options: [
      "Guess",
      "Make something up",
      "Apologize and go get the correct information"
    ],
    correctAnswer: "Apologize and go get the correct information",
    correctIndex: 2,
    category: 'service'
  },
  {
    id: 5,
    question: "If the guest has an allergy, what should you do?",
    type: 'short_answer',
    correctAnswer: "Make sure you ring it in on POS",
    category: 'service'
  },
  {
    id: 6,
    question: "If a guest is allergic to garlic and onion, what allergy is this?",
    type: 'multiple_choice',
    options: [
      "Allium",
      "Gluten",
      "Celiac",
      "Onion and Shallot"
    ],
    correctAnswer: "Allium",
    correctIndex: 0,
    category: 'menu'
  },
  {
    id: 7,
    question: "A guest has an allium allergy and orders the Steak Tartare. How would you ring this in?",
    type: 'short_answer',
    correctAnswer: "Allium allergy alert. No onion/shallot. Alert manager.",
    category: 'menu'
  },
  {
    id: 8,
    question: "What kind of shortening do we use for deep fry? And what oil do we use in the house?",
    type: 'short_answer',
    correctAnswer: "Beef Tallow / Avocado oil",
    category: 'menu'
  },
  {
    id: 9,
    question: "If a vegetarian/vegan wants our French Fries, can they have them? Why?",
    type: 'short_answer',
    correctAnswer: "No, because we use beef tallow",
    category: 'menu'
  },
  {
    id: 10,
    question: "What is special about our Onion Soup?",
    type: 'short_answer',
    correctAnswer: "24 Hour oxtail broth. Shallot crumble.",
    category: 'menu'
  },
  {
    id: 11,
    question: "How many mussels are in the Moule Frites?",
    type: 'multiple_choice',
    options: [
      "20–30",
      "18–22",
      "10–16",
      "16"
    ],
    correctAnswer: "18–22",
    correctIndex: 1,
    category: 'menu'
  },
  {
    id: 12,
    question: "What is the difference between crudo and ceviche?",
    type: 'short_answer',
    correctAnswer: "Crudo is raw and thinly sliced. Ceviche is cured in citrus and diced.",
    category: 'menu'
  },
  {
    id: 13,
    question: "What type of fish is Hamachi?",
    type: 'short_answer',
    correctAnswer: "Japanese Yellowtail",
    category: 'menu'
  },
  {
    id: 14,
    question: "What is Foie Gras? Describe the Foie Gras Terrine.",
    type: 'short_answer',
    correctAnswer: "Fatty duck liver. Foie gras that has been slowly cooked in a mold creating a smooth and luxurious texture. Paired with brûlée brioche to spread the foie gras. A sweet tart relish - fig mostarda. Port Gelée - wine gel. Topped with a pistachio pine nut crumble.",
    category: 'menu'
  },
  {
    id: 15,
    question: "What is Gelée?",
    type: 'short_answer',
    correctAnswer: "\"Jelly\" - A savory gelatin-set jelly",
    category: 'menu'
  },
  {
    id: 16,
    question: "How much lobster comes on the Lobster Salad and Lobster Spaghetti?",
    type: 'short_answer',
    correctAnswer: "Lobster Salad: A whole lobster split and served both in the sauce and on top of the dish. Lobster Spaghetti: ½ Lobster",
    category: 'menu'
  },
  {
    id: 17,
    question: "How many escargots do you get?",
    type: 'short_answer',
    correctAnswer: "6-8",
    category: 'menu'
  },
  {
    id: 18,
    question: "How many clams come with the Linguine Vongole?",
    type: 'short_answer',
    correctAnswer: "12-16",
    category: 'menu'
  },
  {
    id: 19,
    question: "What is the difference between our ravioli and raviolo dish?",
    type: 'short_answer',
    correctAnswer: "Our ravioli is stuffed with mushrooms. Finished with gorgonzola truffle cream sauce. Our Raviolo is open faced with braised oxtail on a bed of sauteed spinach and paired with artichoke barigoule.",
    category: 'menu'
  },
  {
    id: 20,
    question: "What does confit mean?",
    type: 'short_answer',
    correctAnswer: "French cooking technique. Confit means cooking something slowly in oil until very tender, then storing it submerged in that fat to preserve it.",
    category: 'menu'
  },
  {
    id: 21,
    question: "If a guest cannot have pork, can they have the duck confit?",
    type: 'short_answer',
    correctAnswer: "No, because there is pancetta, pork ragout, and sausage.",
    category: 'menu'
  },
  {
    id: 22,
    question: "What seafood is in the Bouillabaisse?",
    type: 'short_answer',
    correctAnswer: "Scallop, Shrimp, Lobster, Seabass, Mussels or Clams",
    category: 'menu'
  },
  {
    id: 23,
    question: "What cuts of meat do we carry, how many oz, and where are they from?",
    type: 'short_answer',
    correctAnswer: "Australia Carrara Wagyu Tenderloin (8 oz), NY Strip (10 oz), NY Strip (14 oz), Prime Porter House (32 oz), Ribeye (16 oz), Wagyu Tomahawk (38 oz), Iberico Pluma Steak (14 oz)",
    category: 'menu'
  },
  {
    id: 24,
    question: "How many people does the charcuterie board feed?",
    type: 'short_answer',
    correctAnswer: "2-6 guests",
    category: 'menu'
  },
  {
    id: 25,
    question: "What is the brand of caviar, what types do we carry, and how many oz?",
    type: 'short_answer',
    correctAnswer: "Marky's, Beluga (1oz) and Osetra imperial gold (2oz)",
    category: 'menu'
  },
  {
    id: 26,
    question: "What accoutrements come with the oysters?",
    type: 'short_answer',
    correctAnswer: "Green Apple Mignonette, Pink peppercorn foam, and pernod citrus granita",
    category: 'menu'
  },
  {
    id: 27,
    question: "If a server asks the SA to 'mark the table,' what does this mean?",
    type: 'short_answer',
    correctAnswer: "Preset the table for the next course. Making sure the guests have the right utensils.",
    category: 'service'
  },
  {
    id: 28,
    question: "What are our hours of operation?",
    type: 'short_answer',
    correctAnswer: "Happy hour 3-6, 7 days a week. Dinner service 5-10, 7 days a week. Friday and Saturday late night 10-2 AM",
    category: 'operations'
  },
  {
    id: 29,
    question: "Before you run food, what should you always check?",
    type: 'multiple_choice',
    options: [
      "If it is to standard",
      "If you know the seat numbers and modifications",
      "Who the server is",
      "All of the above"
    ],
    correctAnswer: "All of the above",
    correctIndex: 3,
    category: 'service'
  },
  {
    id: 30,
    question: "What is the name of our hospitality group and where did we originate?",
    type: 'short_answer',
    correctAnswer: "Aidan Hospitality Group, Toronto Canada",
    category: 'general'
  },
  {
    id: 31,
    question: "Why do we donate 10% and to what cause?",
    type: 'short_answer',
    correctAnswer: "10% goes to autism awareness because it is close to the owner's heart, son is non verbal autistic.",
    category: 'general'
  },
  {
    id: 32,
    question: "How many locations are part of our group?",
    type: 'short_answer',
    correctAnswer: "6 in Canada, 1 in the US",
    category: 'general'
  },
  {
    id: 33,
    question: "What should you bring to your table if they order shellfish?",
    type: 'short_answer',
    correctAnswer: "A bowl for the Shells and a cocktail fork.",
    category: 'service'
  },
  {
    id: 34,
    question: "What are ghost seat numbers and why are they important?",
    type: 'short_answer',
    correctAnswer: "Seats that are empty, you still ring a seat number to have the food runners know which seat number is correct.",
    category: 'service'
  },
  {
    id: 35,
    question: "How many ounces is our wine pour?",
    type: 'short_answer',
    correctAnswer: "6 oz",
    category: 'drinks'
  },
  {
    id: 36,
    question: "How many bar seats do we have?",
    type: 'short_answer',
    correctAnswer: "22 seats",
    category: 'operations'
  },
  {
    id: 37,
    question: "What is sake and what types do we offer?",
    type: 'short_answer',
    correctAnswer: "Japanese Rice Wine, IWA",
    category: 'drinks'
  },
  {
    id: 38,
    question: "What bottled water options do we offer?",
    type: 'short_answer',
    correctAnswer: "Evian - Still, Evian - Sparkling",
    category: 'drinks'
  },
  {
    id: 39,
    question: "What does 'Ce Soir' mean?",
    type: 'short_answer',
    correctAnswer: "Tonight or This evening",
    category: 'general'
  },
  {
    id: 40,
    question: "What kind of mushrooms are in the roasted mushrooms?",
    type: 'short_answer',
    correctAnswer: "Mix of button, oyster, and white beach",
    category: 'menu'
  },
  {
    id: 41,
    question: "What are haricots verts?",
    type: 'short_answer',
    correctAnswer: "A specific longer and thinner more tender variety of green beans.",
    category: 'menu'
  },
  {
    id: 42,
    question: "What is Ibérico pluma steak?",
    type: 'short_answer',
    correctAnswer: "Specific black pig from Spain with an acorn rich diet. The pluma cut refers to the shoulder/neck end of the loin. Wing-like shape gives it the unique look of a feather which is what pluma translates to.",
    category: 'menu'
  },
  {
    id: 43,
    question: "When someone orders a bottle of wine, where do you get it from?",
    type: 'short_answer',
    correctAnswer: "Receive the chit from printer, hand to a manager/sommelier to retrieve.",
    category: 'drinks'
  },
  {
    id: 44,
    question: "What tools must a server/bartender bring with them?",
    type: 'short_answer',
    correctAnswer: "Wine Key, Pens, Server book, lighter",
    category: 'operations'
  },
  {
    id: 45,
    question: "What soft drink do we offer, do we have free refills?",
    type: 'short_answer',
    correctAnswer: "Bottled: Coke, Sprite, Diet Coke, and Ginger ale. Club soda, tonic, grapefruit tonic. No free refills.",
    category: 'drinks'
  },
  {
    id: 46,
    question: "What does mise en place mean and why is it important?",
    type: 'short_answer',
    correctAnswer: "\"Everything in its place\" - having all tools and materials fully prepared and organized",
    category: 'operations'
  },
  {
    id: 47,
    question: "If someone orders coffee/Hot Tea, what is the set up?",
    type: 'short_answer',
    correctAnswer: "Hot Tea: Hot water kettle, Tea cup, Tea packet, Sugar/Honey, and little french cookie. Coffee: Coffee cup, Sugar, and spoon, and little french cookie, milk/cream if needed.",
    category: 'drinks'
  },
  {
    id: 48,
    question: "If a guest seems unsure what to order, how do you guide them?",
    type: 'short_answer',
    correctAnswer: "See what they like, get a flavor profile and budget. Explain menu and specials.",
    category: 'service'
  },
  {
    id: 49,
    question: "How do you handle a guest who pays cash and expects change?",
    type: 'short_answer',
    correctAnswer: "Give the guest the correct change back from the personal bank, if you do not have enough go to the bar for change.",
    category: 'service'
  },
  {
    id: 50,
    question: "What brand of coffee do we carry?",
    type: 'short_answer',
    correctAnswer: "Lavazza",
    category: 'drinks'
  },
  {
    id: 51,
    question: "What juices are available in the house?",
    type: 'short_answer',
    correctAnswer: "Lemonade, Cranberry juice, orange juice, grapefruit juice, and pineapple juice",
    category: 'drinks'
  },
  {
    id: 52,
    question: "What brand of iced tea do we carry, what brand for our hot tea?",
    type: 'short_answer',
    correctAnswer: "Hot tea - Tea forté. Iced tea - The Republic of Tea, Darjeeling-unsweetened",
    category: 'drinks'
  },
  {
    id: 53,
    question: "List our well vodka, gin, rum, bourbon, tequila, and scotch",
    type: 'short_answer',
    correctAnswer: "Grey Goose, Number 3, Brugal, Angels Envy, Dobel, JW black",
    category: 'drinks'
  },
  {
    id: 54,
    question: "If someone orders an espresso martini, what question(s) will you ask?",
    type: 'short_answer',
    correctAnswer: "Would you like baileys, what kind of vodka/tequila",
    category: 'drinks'
  },
  {
    id: 55,
    question: "If someone orders a margarita, what question(s) will you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of tequila would you like, salt or sugar rim, rocks or up",
    category: 'drinks'
  },
  {
    id: 56,
    question: "If someone orders a Lemon drop martini, what question(s) will you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of vodka would you like, sugar rim? Limoncello/no limoncello?",
    category: 'drinks'
  },
  {
    id: 57,
    question: "If someone orders a Manhattan, what question(s) will you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of bourbon or whiskey would you like, up or on the rocks",
    category: 'drinks'
  },
  {
    id: 58,
    question: "List 5 Vodkas we carry",
    type: 'short_answer',
    correctAnswer: "Titos, Grey Goose, Chopin, Truman, Beluga",
    category: 'drinks'
  },
  {
    id: 59,
    question: "List 5 Rums we carry",
    type: 'short_answer',
    correctAnswer: "Brugal, Zacapa 23, El Dorado, Diplomatico Reserva, Sailor Jerry",
    category: 'drinks'
  },
  {
    id: 60,
    question: "List 5 Gins we carry",
    type: 'short_answer',
    correctAnswer: "No3, Hendricks, Monkey 47, Tanqueray 10, Mare",
    category: 'drinks'
  },
  {
    id: 61,
    question: "List 5 Bourbons we carry",
    type: 'short_answer',
    correctAnswer: "Angel's Envy, Basil Hayden, Larceny, Old Forester, Whistle Pig 12",
    category: 'drinks'
  },
  {
    id: 62,
    question: "List 5 Whiskeys we carry",
    type: 'short_answer',
    correctAnswer: "Jack Daniels, Jameson, Michter's Rye, Bulleit Rye, Angel's Envy Rye",
    category: 'drinks'
  },
  {
    id: 63,
    question: "List 5 Tequilas we carry",
    type: 'short_answer',
    correctAnswer: "Clase Azul, Lalo, G4, Tromba, Fuenteseca Blanco",
    category: 'drinks'
  },
  {
    id: 64,
    question: "List 5 Scotches we carry",
    type: 'short_answer',
    correctAnswer: "Lagavulin, Talisker, Arran, Balvenie, Glenfiddich",
    category: 'drinks'
  },
  {
    id: 65,
    question: "What Vermouths do we carry?",
    type: 'short_answer',
    correctAnswer: "Cocchi Torino Sweet vermouth, Carpano Antica Sweet, Dolin Dry",
    category: 'drinks'
  },
  {
    id: 66,
    question: "What is our standard pour if someone orders a mixed drink? (Ex. Vodka soda)",
    type: 'short_answer',
    correctAnswer: "2 oz",
    category: 'drinks'
  },
  {
    id: 67,
    question: "What is our pour for a double?",
    type: 'short_answer',
    correctAnswer: "4 oz",
    category: 'drinks'
  },
  {
    id: 68,
    question: "What brand of ginger beer do we carry?",
    type: 'short_answer',
    correctAnswer: "Fever Tree",
    category: 'drinks'
  },
  {
    id: 69,
    question: "What does a drink ordered \"neat\" mean?",
    type: 'short_answer',
    correctAnswer: "Poured from the bottle at room temperature",
    category: 'drinks'
  },
  {
    id: 70,
    question: "What Macallans will be available?",
    type: 'short_answer',
    correctAnswer: "Macallan 12, Macallan 15, Macallan 18, Macallan M Cooper",
    category: 'drinks'
  },
  {
    id: 71,
    question: "What Cognacs do we have?",
    type: 'short_answer',
    correctAnswer: "Remy Martin VSOP, Hennessy VS, Hennessy XO, Louis XIII",
    category: 'drinks'
  },
  {
    id: 72,
    question: "List the bitters available in house",
    type: 'short_answer',
    correctAnswer: "Chocolate, Grapefruit, Walnut, Amargo, Angostura, Angostura Orange, Peychauds, Hellfire, Old fashioned",
    category: 'drinks'
  },
  {
    id: 73,
    question: "What types of ice do we offer?",
    type: 'short_answer',
    correctAnswer: "Rocks, crushed, cylinder, large cube",
    category: 'drinks'
  }
];

export const getCategoryLabel = (category: FohTestQuestion['category']): string => {
  switch (category) {
    case 'service': return 'Service & Guest Relations';
    case 'menu': return 'Menu Knowledge';
    case 'drinks': return 'Beverage Program';
    case 'operations': return 'Operations';
    case 'general': return 'General Knowledge';
    default: return 'General';
  }
};

export const getCategoryColor = (category: FohTestQuestion['category']): string => {
  switch (category) {
    case 'service': return 'bg-sage/10 text-sage';
    case 'menu': return 'bg-burgundy/10 text-burgundy';
    case 'drinks': return 'bg-copper/10 text-copper';
    case 'operations': return 'bg-gold/10 text-gold';
    case 'general': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};
