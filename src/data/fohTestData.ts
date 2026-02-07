// FoH Test - Front of House Test Questions
// Two test types: Service Staff (Full Test) and Server Assistant

export type TestType = string;

export interface FohTestQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  correctIndex?: number;
  category: 'service' | 'menu' | 'drinks' | 'operations' | 'general';
  testType: TestType;
}

// Service Staff Test - Full Service & Food Knowledge Test + Beverage Knowledge Test
export const serviceStaffQuestions: FohTestQuestion[] = [
  // SERVICE STANDARDS & OPERATIONS
  {
    id: 1,
    question: "How long should it take to greet a table after they are seated?",
    type: 'multiple_choice',
    options: [
      "Less than 3 minutes",
      "Less than 2 minutes",
      "Within 1 minute"
    ],
    correctAnswer: "Within 1 minute",
    correctIndex: 2,
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 2,
    question: "What is Ce Soir's full address?",
    type: 'short_answer',
    correctAnswer: "492 Bayfront Place, Naples, FL 34102",
    category: 'general',
    testType: 'service_staff'
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
    category: 'service',
    testType: 'service_staff'
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
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 5,
    question: "If a guest has an allergy, what steps should you take?",
    type: 'short_answer',
    correctAnswer: "Alert the kitchen immediately, note it in POS, inform manager, double-check modifications before serving",
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 6,
    question: "If a guest is allergic to garlic and onion, what allergy is this?",
    type: 'multiple_choice',
    options: [
      "Allium",
      "Gluten",
      "Celiac",
      "Onion and shallot"
    ],
    correctAnswer: "Allium",
    correctIndex: 0,
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 7,
    question: "A guest has an allium allergy and orders the Steak Tartare. How would you ring this in?",
    type: 'short_answer',
    correctAnswer: "Ring in with allium allergy modifier, no onion/shallot, alert manager and kitchen",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 8,
    question: "What kind of shortening do we use for deep frying, and what oil do we use in the house?",
    type: 'short_answer',
    correctAnswer: "Beef tallow for deep frying, avocado oil in the house",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 9,
    question: "If a vegetarian or vegan guest wants our French fries, can they have them? Why or why not?",
    type: 'short_answer',
    correctAnswer: "No, because we use beef tallow for frying",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 10,
    question: "What is special about our Onion Soup?",
    type: 'short_answer',
    correctAnswer: "24-hour oxtail broth with shallot crumble",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 11,
    question: "How many mussels are served in the Moule Frites?",
    type: 'multiple_choice',
    options: [
      "20–30",
      "18–22",
      "10–16",
      "16"
    ],
    correctAnswer: "18–22",
    correctIndex: 1,
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 12,
    question: "What is the difference between crudo and ceviche?",
    type: 'short_answer',
    correctAnswer: "Crudo is raw and thinly sliced. Ceviche is cured in citrus and diced.",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 13,
    question: "What type of fish is Hamachi?",
    type: 'short_answer',
    correctAnswer: "Japanese Yellowtail",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 14,
    question: "What is foie gras? Describe our foie gras terrine.",
    type: 'short_answer',
    correctAnswer: "Fatty duck liver. Slowly cooked in a mold for smooth, luxurious texture. Served with brûlée brioche, fig mostarda, port gelée, and pistachio pine nut crumble.",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 15,
    question: "What is gelée?",
    type: 'short_answer',
    correctAnswer: "A savory gelatin-set jelly (French for 'jelly')",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 16,
    question: "How much lobster comes on each dish? (Lobster Salad and Lobster Spaghetti)",
    type: 'short_answer',
    correctAnswer: "Lobster Salad: whole lobster split and served in sauce and on top. Lobster Spaghetti: half lobster.",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 17,
    question: "How many escargots are served per order?",
    type: 'short_answer',
    correctAnswer: "6-8 escargots",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 18,
    question: "How many clams come with the Linguine Vongole?",
    type: 'short_answer',
    correctAnswer: "12-16 clams",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 19,
    question: "What does 'confit' mean?",
    type: 'short_answer',
    correctAnswer: "French cooking technique - cooking something slowly in oil/fat until very tender, then storing it submerged in that fat to preserve it",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 20,
    question: "If a guest cannot eat pork, can they have the duck confit? Explain.",
    type: 'short_answer',
    correctAnswer: "No, because the dish contains pancetta, pork ragout, and sausage",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 21,
    question: "What seafood is included in the Bouillabaisse, and how much of each?",
    type: 'short_answer',
    correctAnswer: "Scallop, shrimp, lobster, seabass, mussels or clams",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 22,
    question: "What cuts of meat do we carry? Include ounces and country of origin.",
    type: 'short_answer',
    correctAnswer: "Australia Carrara Wagyu: Tenderloin (8oz), NY Strip (10oz, 14oz), Prime Porterhouse (32oz), Ribeye (16oz), Wagyu Tomahawk (38oz), Iberico Pluma Steak (14oz from Spain)",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 23,
    question: "How many people does the charcuterie board feed?",
    type: 'short_answer',
    correctAnswer: "2-6 guests",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 24,
    question: "What is the brand of caviar we serve, what types do we carry, and how many ounces per order?",
    type: 'short_answer',
    correctAnswer: "Marky's caviar. Beluga (1oz) and Osetra Imperial Gold (2oz)",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 25,
    question: "What accoutrements are served with oysters?",
    type: 'short_answer',
    correctAnswer: "Green apple mignonette, pink peppercorn foam, and pernod citrus granita",
    category: 'menu',
    testType: 'service_staff'
  },
  {
    id: 26,
    question: "If a server asks the SA to 'mark the table,' what does this mean?",
    type: 'short_answer',
    correctAnswer: "Preset the table for the next course with the correct utensils",
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 27,
    question: "What are our hours of operation?",
    type: 'short_answer',
    correctAnswer: "Happy hour 3-6pm, 7 days a week. Dinner service 5-10pm, 7 days a week. Friday and Saturday late night 10pm-2am.",
    category: 'operations',
    testType: 'service_staff'
  },
  {
    id: 28,
    question: "Before you run food, what should you always check?",
    type: 'multiple_choice',
    options: [
      "That the dish meets standards",
      "Seat numbers and modifications",
      "Who the server is",
      "All of the above"
    ],
    correctAnswer: "All of the above",
    correctIndex: 3,
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 29,
    question: "What is the name of our hospitality group and where did it originate?",
    type: 'short_answer',
    correctAnswer: "Aidan Hospitality Group, originated in Toronto, Canada",
    category: 'general',
    testType: 'service_staff'
  },
  {
    id: 30,
    question: "Why do we donate 10% of profits, and to what cause?",
    type: 'short_answer',
    correctAnswer: "10% goes to autism awareness because it is close to the owner's heart - his son is non-verbal autistic",
    category: 'general',
    testType: 'service_staff'
  },
  {
    id: 31,
    question: "How many locations are part of our hospitality group?",
    type: 'short_answer',
    correctAnswer: "6 in Canada, 1 in the US",
    category: 'general',
    testType: 'service_staff'
  },
  {
    id: 32,
    question: "What should you bring to the table when guests order shellfish?",
    type: 'short_answer',
    correctAnswer: "A bowl for the shells and a cocktail fork",
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 33,
    question: "What are ghost seat numbers and why are they important?",
    type: 'short_answer',
    correctAnswer: "Empty seats that still need a number assigned so food runners know the correct seat positions",
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 34,
    question: "What does 'mise en place' mean, and why is it important?",
    type: 'short_answer',
    correctAnswer: "'Everything in its place' - having all tools and materials fully prepared and organized before service",
    category: 'operations',
    testType: 'service_staff'
  },
  {
    id: 35,
    question: "Describe the proper setup for: Hot Tea and Coffee",
    type: 'short_answer',
    correctAnswer: "Hot Tea: hot water kettle, tea cup, tea packet, sugar/honey, French cookie. Coffee: coffee cup, sugar, spoon, French cookie, milk/cream if needed.",
    category: 'service',
    testType: 'service_staff'
  },
  {
    id: 36,
    question: "What does 'Ce Soir' mean?",
    type: 'short_answer',
    correctAnswer: "Tonight or This evening (French)",
    category: 'general',
    testType: 'service_staff'
  },
  // BEVERAGE KNOWLEDGE SECTION
  {
    id: 37,
    question: "How many ounces is our standard wine pour?",
    type: 'short_answer',
    correctAnswer: "6 ounces",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 38,
    question: "How many seats do we have? (Bar and Raw Bar)",
    type: 'short_answer',
    correctAnswer: "Bar: 22 seats. Raw Bar: varies by seating arrangement.",
    category: 'operations',
    testType: 'service_staff'
  },
  {
    id: 39,
    question: "What is sake, and what styles do we offer?",
    type: 'short_answer',
    correctAnswer: "Japanese rice wine. We offer IWA sake.",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 40,
    question: "What bottled water options do we offer?",
    type: 'short_answer',
    correctAnswer: "Evian Still and Evian Sparkling",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 41,
    question: "When a guest orders a bottle of wine, what is the procedure for retrieving it?",
    type: 'short_answer',
    correctAnswer: "Receive the chit from the printer, hand it to a manager or sommelier to retrieve the bottle",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 42,
    question: "What tools must every server or bartender bring to their shift?",
    type: 'short_answer',
    correctAnswer: "Wine key, pens, server book, lighter",
    category: 'operations',
    testType: 'service_staff'
  },
  {
    id: 43,
    question: "What soft drinks do we offer? Do we provide free refills?",
    type: 'short_answer',
    correctAnswer: "Coke, Sprite, Diet Coke, Ginger Ale, Club Soda, Tonic, Grapefruit Tonic. No free refills.",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 44,
    question: "What brand of coffee do we serve?",
    type: 'short_answer',
    correctAnswer: "Lavazza",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 45,
    question: "What juices are available in-house?",
    type: 'short_answer',
    correctAnswer: "Lemonade, cranberry juice, orange juice, grapefruit juice, pineapple juice",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 46,
    question: "What brand of iced tea do we serve? What brand is used for hot tea?",
    type: 'short_answer',
    correctAnswer: "Iced tea: The Republic of Tea (Darjeeling, unsweetened). Hot tea: Tea Forté.",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 47,
    question: "List all white wines by the glass.",
    type: 'short_answer',
    correctAnswer: "Varies by current wine list - check with sommelier for current offerings",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 48,
    question: "List all rosé or 'interesting' wines by the glass.",
    type: 'short_answer',
    correctAnswer: "Varies by current wine list - check with sommelier for current offerings",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 49,
    question: "List all sparkling wines by the glass.",
    type: 'short_answer',
    correctAnswer: "Varies by current wine list - check with sommelier for current offerings",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 50,
    question: "List all red wines by the glass.",
    type: 'short_answer',
    correctAnswer: "Varies by current wine list - check with sommelier for current offerings",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 51,
    question: "If a guest orders an espresso martini, what questions should you ask?",
    type: 'short_answer',
    correctAnswer: "Would you like Baileys? What kind of vodka or tequila would you prefer?",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 52,
    question: "If a guest orders a margarita, what questions should you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of tequila? Salt or sugar rim? Rocks or up?",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 53,
    question: "If a guest orders a lemon drop martini, what questions should you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of vodka? Sugar rim? With or without limoncello?",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 54,
    question: "If a guest orders a Manhattan, what questions should you ask?",
    type: 'short_answer',
    correctAnswer: "What kind of bourbon or whiskey? Up or on the rocks?",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 55,
    question: "List five vodkas.",
    type: 'short_answer',
    correctAnswer: "Tito's, Grey Goose, Chopin, Beluga, Truman (or similar from our selection)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 56,
    question: "List five rums.",
    type: 'short_answer',
    correctAnswer: "Brugal, Zacapa 23, El Dorado, Diplomatico Reserva, Sailor Jerry (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 57,
    question: "List five gins.",
    type: 'short_answer',
    correctAnswer: "No. 3, Hendrick's, Monkey 47, Tanqueray 10, Mare (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 58,
    question: "List five bourbons.",
    type: 'short_answer',
    correctAnswer: "Angel's Envy, Basil Hayden, Woodford Reserve, Old Forester, Four Roses (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 59,
    question: "List five whiskeys.",
    type: 'short_answer',
    correctAnswer: "Jack Daniel's, Jameson, Michter's Rye, Bulleit Rye, Crown Royal (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 60,
    question: "List five tequilas and at least two mezcals.",
    type: 'short_answer',
    correctAnswer: "Tequilas: Clase Azul, Lalo, G4, Tromba, Patron. Mezcals: Del Maguey Vida, Montelobos (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 61,
    question: "List five scotches.",
    type: 'short_answer',
    correctAnswer: "Lagavulin, Talisker, Macallan, Balvenie, Glenfiddich (or similar)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 62,
    question: "What vermouths do we carry?",
    type: 'short_answer',
    correctAnswer: "Dolin Dry, Dolin Rouge, Carpano Antica Formula (or current selection)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 63,
    question: "What is our standard pour for a mixed drink?",
    type: 'short_answer',
    correctAnswer: "1.5 ounces",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 64,
    question: "What is our pour for a double?",
    type: 'short_answer',
    correctAnswer: "3 ounces",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 65,
    question: "What brand of ginger beer do we carry?",
    type: 'short_answer',
    correctAnswer: "Fever-Tree (or current selection)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 66,
    question: "What does it mean when a drink is ordered 'neat'?",
    type: 'short_answer',
    correctAnswer: "Served at room temperature without ice, straight from the bottle",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 67,
    question: "Name all Macallans that we offer.",
    type: 'short_answer',
    correctAnswer: "Macallan 12, Macallan 18 (or current selection)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 68,
    question: "What cognacs do we carry?",
    type: 'short_answer',
    correctAnswer: "Rémy Martin VSOP, Louis XIII, Hennessy (or current selection)",
    category: 'drinks',
    testType: 'service_staff'
  },
  {
    id: 69,
    question: "What types of ice do we offer?",
    type: 'short_answer',
    correctAnswer: "Regular cubed ice, large format ice cubes/spheres for spirits",
    category: 'drinks',
    testType: 'service_staff'
  }
];

// Server Assistant Test - Focused on SA-specific duties
// Note: Duplicates with Service Staff test have been removed to keep tests distinct
export const serverAssistantQuestions: FohTestQuestion[] = [
  {
    id: 1,
    question: "What is the mise en place for the expo line?",
    type: 'short_answer',
    correctAnswer: "All necessary tools, plates, garnishes, and utensils organized and ready for service",
    category: 'operations',
    testType: 'server_assistant'
  },
  {
    id: 2,
    question: "If a server asks you to mark the table, what does this mean?",
    type: 'short_answer',
    correctAnswer: "Preset the table for the next course with the correct utensils",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 3,
    question: "What should your initial water greet at a table include?",
    type: 'short_answer',
    correctAnswer: "Offer still or sparkling water, pour water for guests, mention bottled water options",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 4,
    question: "If a guest asks you to take their order, what should you do?",
    type: 'short_answer',
    correctAnswer: "Politely let them know their server will be right with them, or find their server immediately",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 5,
    question: "What should you do if food arrives at the table and the guest says it is not what they ordered?",
    type: 'short_answer',
    correctAnswer: "Apologize, do not leave the dish, notify the server and/or manager immediately",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 6,
    question: "What should you do if you notice a guest has finished a course and their plates have not yet been cleared?",
    type: 'short_answer',
    correctAnswer: "Clear the plates promptly or notify the server that the table needs attention",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 7,
    question: "When clearing plates, what should you always ask or confirm with the guest?",
    type: 'short_answer',
    correctAnswer: "Ask if they are finished or if you may clear their plate",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 8,
    question: "What should you do if a guest drops silverware or a napkin on the floor?",
    type: 'short_answer',
    correctAnswer: "Immediately replace it with fresh silverware/napkin without being asked",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 9,
    question: "What items should never be touched with bare hands?",
    type: 'short_answer',
    correctAnswer: "Ice, garnishes, ready-to-eat food, and the eating surfaces of plates/silverware",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 10,
    question: "What should you do if you notice a table needs water refills but the server is busy?",
    type: 'short_answer',
    correctAnswer: "Refill the water yourself - it's a team effort",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 11,
    question: "What should you do if you overhear a guest mentioning an allergy at the table?",
    type: 'short_answer',
    correctAnswer: "Immediately inform the server and/or manager about the allergy",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 12,
    question: "What does 'full hands in, full hands out' mean?",
    type: 'short_answer',
    correctAnswer: "Never walk through the restaurant empty-handed - always carry something (plates, glasses, etc.) in both directions",
    category: 'operations',
    testType: 'server_assistant'
  },
  {
    id: 13,
    question: "What is your responsibility when resetting a table for the next seating?",
    type: 'short_answer',
    correctAnswer: "Clear all items, wipe down table, reset with clean linens, silverware, glassware, and any standard table settings",
    category: 'operations',
    testType: 'server_assistant'
  },
  {
    id: 14,
    question: "If a dish is hot, what must you communicate to the guest?",
    type: 'short_answer',
    correctAnswer: "Warn them that the plate is hot - 'Careful, the plate is very hot'",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 15,
    question: "What should you do if a guest stops you to ask for the restroom?",
    type: 'short_answer',
    correctAnswer: "Politely direct them or personally escort them to the restroom location",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 16,
    question: "Who do you communicate with if you are unsure about a task or instruction?",
    type: 'short_answer',
    correctAnswer: "Your server, a manager, or the floor supervisor",
    category: 'operations',
    testType: 'server_assistant'
  },
  {
    id: 17,
    question: "Why is teamwork especially important during peak service?",
    type: 'short_answer',
    correctAnswer: "To ensure smooth guest experience, prevent delays, and maintain service standards when the restaurant is busiest",
    category: 'operations',
    testType: 'server_assistant'
  },
  {
    id: 18,
    question: "What is the proper response if a guest thanks you?",
    type: 'short_answer',
    correctAnswer: "'You're welcome' or 'My pleasure' - always acknowledge with warmth and professionalism",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 19,
    question: "How should you carry multiple plates safely to a table?",
    type: 'short_answer',
    correctAnswer: "Use proper hand positioning, balance weight evenly, never stack plates too high, and use a tray when appropriate",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 20,
    question: "What is the correct way to present a dish to a guest?",
    type: 'short_answer',
    correctAnswer: "Serve from the left side, announce the dish name, place it gently with the protein facing the guest",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 21,
    question: "What should you do if you accidentally bump into a guest?",
    type: 'short_answer',
    correctAnswer: "Immediately apologize sincerely and ask if they are okay",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 22,
    question: "When should you refill bread or butter for a table?",
    type: 'short_answer',
    correctAnswer: "When the basket is less than half full or upon guest request",
    category: 'service',
    testType: 'server_assistant'
  },
  {
    id: 23,
    question: "How do you handle a spill on a guest's table?",
    type: 'short_answer',
    correctAnswer: "Apologize, quickly bring clean napkins, offer to replace any affected items, notify the server/manager",
    category: 'service',
    testType: 'server_assistant'
  }
];

// Combined questions for backward compatibility
export const fohTestQuestions: FohTestQuestion[] = [
  ...serviceStaffQuestions,
  ...serverAssistantQuestions
];

// Helper functions
export const getQuestionsByTestType = (testType: TestType): FohTestQuestion[] => {
  return testType === 'service_staff' ? serviceStaffQuestions : serverAssistantQuestions;
};

export const getTestTypeLabel = (testType: TestType): string => {
  return testType === 'service_staff' ? 'Service Staff Test' : 'Server Assistant Test';
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'service': 'Service Standards',
    'menu': 'Menu Knowledge',
    'drinks': 'Beverage Knowledge',
    'operations': 'Operations',
    'general': 'General Knowledge',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'service': 'bg-burgundy/20 text-burgundy',
    'menu': 'bg-jade/20 text-jade',
    'drinks': 'bg-gold/20 text-gold',
    'operations': 'bg-terracotta/20 text-terracotta',
    'general': 'bg-muted text-muted-foreground',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};
