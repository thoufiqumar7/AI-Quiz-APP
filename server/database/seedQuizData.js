const mongoose = require('mongoose');
const env = require('../config/env');
const Category = require('../models/Category');
const Question = require('../models/Question');

async function run() {
  await mongoose.connect(env.mongoUri);

  await Promise.all([Category.deleteMany({}), Question.deleteMany({})]);

  const [js, node, cs] = await Category.insertMany([
    {
      name: 'JavaScript',
      description: 'Core JavaScript concepts and language features.',
      icon: 'code',
    },
    {
      name: 'Node.js',
      description: 'Runtime, modules, and backend development practices.',
      icon: 'server',
    },
    {
      name: 'Computer Science',
      description: 'Fundamental algorithms, data structures, and system basics.',
      icon: 'cpu',
    },
  ]);

  const questions = [
    {
      category: js._id,
      difficulty: 'easy',
      topic: 'Arrays',
      question: 'Which method creates a new array with items passing a condition?',
      options: ['map', 'filter', 'reduce', 'forEach'],
      answer: 'filter',
      explanation: 'filter returns only items that satisfy the callback condition.',
    },
    {
      category: js._id,
      difficulty: 'easy',
      topic: 'Variables',
      question: 'Which keyword declares a block-scoped variable?',
      options: ['var', 'let', 'const only', 'function'],
      answer: 'let',
      explanation: 'let and const are block scoped; var is function scoped.',
    },
    {
      category: js._id,
      difficulty: 'medium',
      topic: 'JSON',
      question: 'What is the output type of JSON.parse on valid JSON?',
      options: ['Function', 'Object or array value', 'String only', 'Boolean only'],
      answer: 'Object or array value',
      explanation: 'JSON.parse converts JSON text into corresponding JavaScript value.',
    },
    {
      category: js._id,
      difficulty: 'medium',
      topic: 'Async',
      question: 'What does Promise.all return when all promises resolve?',
      options: ['Single object', 'Array of resolved values', 'Boolean', 'First value only'],
      answer: 'Array of resolved values',
      explanation: 'Promise.all resolves to an array of results in original order.',
    },
    {
      category: js._id,
      difficulty: 'hard',
      topic: 'Closures',
      question: 'Which behavior is true for closures in JavaScript?',
      options: [
        'They only work in strict mode',
        'They lose access to parent scope after return',
        'They preserve access to lexical scope',
        'They are identical to classes',
      ],
      answer: 'They preserve access to lexical scope',
      explanation: 'Closures capture surrounding lexical variables even after outer function returns.',
    },
    {
      category: js._id,
      difficulty: 'hard',
      topic: 'Event Loop',
      question: 'Which queue has higher priority in modern JavaScript runtimes?',
      options: ['Macrotask queue', 'Microtask queue', 'Render queue', 'Timer queue'],
      answer: 'Microtask queue',
      explanation: 'Microtasks are drained before the next macrotask.',
    },

    {
      category: node._id,
      difficulty: 'easy',
      topic: 'NPM',
      question: 'Which command installs a package locally with npm?',
      options: ['npm add package-name', 'npm install package-name', 'npm get package-name', 'npm package-name'],
      answer: 'npm install package-name',
      explanation: 'npm install adds a package locally by default.',
    },
    {
      category: node._id,
      difficulty: 'easy',
      topic: 'Modules',
      question: 'Which extension is common for Node.js CommonJS modules?',
      options: ['.mjs', '.json', '.js', '.cjs only'],
      answer: '.js',
      explanation: 'CommonJS often uses .js files.',
    },
    {
      category: node._id,
      difficulty: 'medium',
      topic: 'Express',
      question: 'What does express.json() middleware do?',
      options: ['Serves static files', 'Parses JSON request body', 'Encrypts responses', 'Validates JWT tokens'],
      answer: 'Parses JSON request body',
      explanation: 'express.json parses incoming JSON payload and sets req.body.',
    },
    {
      category: node._id,
      difficulty: 'medium',
      topic: 'HTTP',
      question: 'Which status code commonly indicates unauthorized access?',
      options: ['200', '201', '401', '500'],
      answer: '401',
      explanation: '401 indicates authentication is required or invalid.',
    },
    {
      category: node._id,
      difficulty: 'hard',
      topic: 'Event Loop',
      question: 'What is the event loop in Node.js primarily responsible for?',
      options: ['Compiling TypeScript', 'Handling non-blocking async operations', 'Storing MongoDB data', 'Running React components'],
      answer: 'Handling non-blocking async operations',
      explanation: 'Node uses an event loop to process asynchronous callbacks efficiently.',
    },
    {
      category: node._id,
      difficulty: 'hard',
      topic: 'Streams',
      question: 'Which stream type can both read and write?',
      options: ['Readable', 'Writable', 'Duplex', 'Transformless'],
      answer: 'Duplex',
      explanation: 'Duplex streams support both readable and writable interfaces.',
    },

    {
      category: cs._id,
      difficulty: 'easy',
      topic: 'Data Structures',
      question: 'Which data structure follows FIFO order?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      answer: 'Queue',
      explanation: 'FIFO means first-in first-out, which is queue behavior.',
    },
    {
      category: cs._id,
      difficulty: 'easy',
      topic: 'Complexity',
      question: 'Which notation describes upper bound complexity?',
      options: ['Big O', 'Big Omega', 'Theta', 'Lambda'],
      answer: 'Big O',
      explanation: 'Big O indicates asymptotic upper bound.',
    },
    {
      category: cs._id,
      difficulty: 'medium',
      topic: 'Algorithms',
      question: 'What is the average time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answer: 'O(log n)',
      explanation: 'Binary search halves the search range each step.',
    },
    {
      category: cs._id,
      difficulty: 'medium',
      topic: 'Trees',
      question: 'What property defines a binary search tree?',
      options: ['Parent greater than children always', 'Left subtree < node < right subtree', 'All nodes have two children', 'Traversal is always linear'],
      answer: 'Left subtree < node < right subtree',
      explanation: 'BST keeps ordered relation between left node right values.',
    },
    {
      category: cs._id,
      difficulty: 'hard',
      topic: 'Traversal',
      question: 'Which traversal uses a queue in tree processing?',
      options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
      answer: 'Level-order',
      explanation: 'Level-order (BFS) is commonly implemented with a queue.',
    },
    {
      category: cs._id,
      difficulty: 'hard',
      topic: 'Graphs',
      question: 'Dijkstra algorithm is used to solve which problem?',
      options: ['Maximum spanning tree', 'Shortest path in weighted graph', 'Topological sorting', 'String matching'],
      answer: 'Shortest path in weighted graph',
      explanation: 'Dijkstra finds shortest path from source with non-negative edges.',
    },
  ];

  await Question.insertMany(questions);

  console.log('Quiz seed data inserted successfully.');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
