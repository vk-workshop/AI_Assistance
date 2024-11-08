import express, { json } from 'express';
import cors from'cors';
import OpenAI from "openai";
import dotenv from 'dotenv';

const PORT = process.env.PORT || 3002;
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const openai = new OpenAI({
  apiKey: process.env['API_KEY'],
});

const functionsObj = {
  listOfBooks: async ({ genre }) => {
    return db.filter((item) => item.genre === genre).map((item) => ({ name: item.name, id: item.id }));
  },
  searchBook: async ({ name }) => {
    return db.filter((item) => item.name.includes(name)).map((item) => ({ name: item.name, id: item.id }));
  },
  getBook: async ({ id }) => {
    return db.find((item) => item.id === id);
  },
  getByYear: async ({ year }) => {
    return db.filter((item) => item.publicationYear === year).map((item) => ({ name: item.name, id: item.id }));
  },
  sortByRating: async () => {
    return [...db].sort((a, b) => b.rating - a.rating).map((item) => ({ name: item.name, id: item.id }));
  }
};

const tools = [
  {
    type: 'function',
    function: {
      function: functionsObj.listOfBooks,
      parse: JSON.parse,
      description: 'Queries books by genre and returns a list of book names.',
      parameters: {
        type: 'object',
        properties: {
          genre: { type: 'string', enum: ['mystery', 'nonfiction', 'memoir', 'romance', 'historical'] },
        },
      },
    }
  },
  {
    type: 'function',
    function: {
      function: functionsObj.searchBook,
      parse: JSON.parse,
      description: 'Searches books by their name and returns a list of book names and their IDs.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    }
  },
  {
    type: 'function',
    function: {
      function: functionsObj.getBook,
      parse: JSON.parse,
      description:
      "getBook returns a book's detailed information based on the id of the book. Note that this does not accept names, and only IDs, which you can get by using search.",
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    }
  },
  {
    type: 'function',
    function: {
      function: functionsObj.getByYear,
      parse: JSON.parse,
      description: 'Searches books by their year and returns a list of book names and their IDs.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'number' },
        },
      },
    }
  },
  {
    type: 'function',
    function: {
      function: functionsObj.sortByRating,
      parse: JSON.parse,
      description: 'Sort books by their rating from higher to lower and returns a list of book names and their IDs.',
      parameters: {
        type: 'object',
        properties: {
          rating: { type: 'number' },
        },
      },
    }
  }
]

app.post('/', async (req, res) => {
  try {
    const runner = openai.beta.chat.completions
      .runTools({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: req.body.message },
        ],
        tools,
      })

    const result = await runner.finalContent();

    res.send(JSON.stringify(result));
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));

const db = [
  {
    id: 'a1',
    name: 'To Kill a Mockingbird',
    genre: 'historical',
    description: `Compassionate, dramatic, and deeply moving, "To Kill A Mockingbird" takes readers to the roots of human behavior...`,
    author: 'Harper Lee',
    publicationYear: 1960,
    rating: 4.8,
    pages: 281,
    language: 'English',
    publisher: 'J.B. Lippincott & Co.',
  },
  {
    id: 'a2',
    name: 'All the Light We Cannot See',
    genre: 'historical',
    description: `In a mining town in Germany, Werner Pfennig, an orphan, grows up with his younger sister...`,
    author: 'Anthony Doerr',
    publicationYear: 2014,
    rating: 4.5,
    pages: 544,
    language: 'English',
    publisher: 'Scribner',
  },
  {
    id: 'a3',
    name: 'Where the Crawdads Sing',
    genre: 'historical',
    description: `For years, rumors of the “Marsh Girl” haunted Barkley Cove, a quiet fishing village...`,
    author: 'Delia Owens',
    publicationYear: 2018,
    rating: 4.7,
    pages: 384,
    language: 'English',
    publisher: 'G.P. Putnam\'s Sons',
  },
  {
    id: 'b1',
    name: 'Gone Girl',
    genre: 'mystery',
    description: `With her razor-sharp writing and trademark psychological insight, Gillian Flynn delivers a fast-paced...`,
    author: 'Gillian Flynn',
    publicationYear: 2012,
    rating: 4.1,
    pages: 422,
    language: 'English',
    publisher: 'Crown Publishing Group',
  },
  {
    id: 'b2',
    name: 'The Girl with the Dragon Tattoo',
    genre: 'mystery',
    description: `In Stieg Larsson's first installment of the Millennium Series, "The Girl with the Dragon Tattoo"...`,
    author: 'Stieg Larsson',
    publicationYear: 2005,
    rating: 4.3,
    pages: 465,
    language: 'English',
    publisher: 'Norstedts Förlag',
  },
  {
    id: 'b3',
    name: 'The Da Vinci Code',
    genre: 'mystery',
    description: `Dan Brown's bestseller "The Da Vinci Code" follows Robert Langdon as he uncovers hidden clues...`,
    author: 'Dan Brown',
    publicationYear: 2003,
    rating: 4.0,
    pages: 454,
    language: 'English',
    publisher: 'Doubleday',
  },
  {
    id: 'c1',
    name: 'Educated',
    genre: 'memoir',
    description: `Tara Westover's memoir "Educated" tells the story of her journey from growing up in a strict...`,
    author: 'Tara Westover',
    publicationYear: 2018,
    rating: 4.7,
    pages: 334,
    language: 'English',
    publisher: 'Random House',
  },
  {
    id: 'c2',
    name: 'Becoming',
    genre: 'memoir',
    description: `In her memoir "Becoming," former First Lady Michelle Obama chronicles her life’s journey...`,
    author: 'Michelle Obama',
    publicationYear: 2018,
    rating: 4.6,
    pages: 448,
    language: 'English',
    publisher: 'Crown Publishing Group',
  },
  {
    id: 'c3',
    name: 'The Glass Castle',
    genre: 'memoir',
    description: `Jeannette Walls' "The Glass Castle" is a poignant and gripping memoir of her turbulent and nomadic childhood...`,
    author: 'Jeannette Walls',
    publicationYear: 2005,
    rating: 4.3,
    pages: 288,
    language: 'English',
    publisher: 'Scribner',
  },
  {
    id: 'd1',
    name: 'Sapiens: A Brief History of Humankind',
    genre: 'nonfiction',
    description: `Yuval Noah Harari's "Sapiens" explores the history of humanity from the evolution of archaic human species...`,
    author: 'Yuval Noah Harari',
    publicationYear: 2011,
    rating: 4.5,
    pages: 443,
    language: 'English',
    publisher: 'Harvill Secker',
  },
  {
    id: 'd2',
    name: 'The Immortal Life of Henrietta Lacks',
    genre: 'nonfiction',
    description: `Rebecca Skloot's "The Immortal Life of Henrietta Lacks" traces the story of an African American woman...`,
    author: 'Rebecca Skloot',
    publicationYear: 2010,
    rating: 4.6,
    pages: 381,
    language: 'English',
    publisher: 'Crown Publishing Group',
  },
  {
    id: 'd3',
    name: 'Quiet: The Power of Introverts in a World That Can’t Stop Talking',
    genre: 'nonfiction',
    description: `Susan Cain's "Quiet" explores the power and contributions of introverts...`,
    author: 'Susan Cain',
    publicationYear: 2012,
    rating: 4.4,
    pages: 352,
    language: 'English',
    publisher: 'Crown Publishing Group',
  },
  {
    id: 'e1',
    name: 'Pride and Prejudice',
    genre: 'romance',
    description: `Jane Austen's "Pride and Prejudice" is one of the most beloved romantic novels in English literature...`,
    author: 'Jane Austen',
    publicationYear: 1813,
    rating: 4.6,
    pages: 279,
    language: 'English',
    publisher: 'T. Egerton, Whitehall',
  },
  {
    id: 'e2',
    name: 'The Notebook',
    genre: 'romance',
    description: `Nicholas Sparks' "The Notebook" is a tender love story that spans decades...`,
    author: 'Nicholas Sparks',
    publicationYear: 1996,
    rating: 4.2,
    pages: 214,
    language: 'English',
    publisher: 'Warner Books',
  },
  {
    id: 'e3',
    name: 'Outlander',
    genre: 'romance',
    description: `Diana Gabaldon's "Outlander" series combines romance, adventure, and historical fiction...`,
    author: 'Diana Gabaldon',
    publicationYear: 1991,
    rating: 4.4,
    pages: 627,
    language: 'English',
    publisher: 'Delacorte Press',
  },
];

