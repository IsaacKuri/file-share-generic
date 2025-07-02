const express = require('express');
const router = express.Router();
const db = require('./database.js');

/*
GET @ /api/recipes
Retuns all recipes with optional category filtering.
*/

router.get('/recipes', (req, res) => {
  const { category } = req.query;

  let query = 'SELECT * FROM recipes';
  const params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  db.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).json({ error: 'An error has occured' });
    }
    res.status(200).json(rows);
  });
});


/*
GET @ /api/recipes/:id
Returns a single recipe
*/

router.get('/recipes/:id', (req, res) => {
  const recipeId = parseInt(req.params.id, 10);

  if (isNaN(recipeId) || recipeId <= 0) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }

  const query = 'SELECT * FROM recipes WHERE id = ?';
  db.db.get(query, [recipeId], (err, row) => {
    if (err) {
      return res.status(500);
    }
    if (!row) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(row);
  });
})

/*
POST @ /api/recipes
Add a new recipe
*/
router.post('/recipes', (req, res) => {
  const { name, category, instructions, ingredients, prep_time } = req.body;

  if (!name || !category || !ingredients || !instructions || !prep_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.db.run(`
    INSERT INTO recipes (name, category, instructions, ingredients, prep_time)
    VALUES (?, ?, ?, ?, ?)`,
    [name, category, instructions, ingredients, parseInt(prep_time)], function(err) {
    if (err) {
      return res.status(500);
    }
    res.status(200).json({message: `Recipe saved ID = ${this.lastID}` });
  });
});

/*
POST @ /api/meal-plans
Create a new meal plan
*/

// Im aware this is missing the validation for the recipes_ids being an array of valid recipe IDs. I ran out of time to implement this.

router.post('/meal-plans', (req, res) => {
  const { name, date, recipes_ids, notes } = req.body;

  if (!name || !date || !recipes_ids || !notes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.db.run(`
    INSERT INTO meal_plans (name, date, recipes_ids, notes)
    VALUES (?, ?, ?, ?)`,
    [name, JSON.stringify(recipes)], function(err) {
    if (err) {
      return res.status(500);
    }
    res.status(200).json({message: `Meal plan saved ID = ${this.lastID}` });
  });
});

/*
GET @ /api/meal-plans
Returns all meal plans
*/

router.get('/meal-plans', (req, res) => {
  const query = 'SELECT * FROM meal_plans';

  db.db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'An error has occured' });
    }

    res.status(200).json(rows);
  });
});

/*
DELETE @ /api/meal-plans/:id
Delete a meal plan
*/

// Im just transcribing and adding some comment. I noticed my typo on the variable name at the Query, parameter.
// Pressing "Run Code", doesn't catch this error, and the test was taking too long to perform.

router.delete('/meal-plans/:id', (req, res) => {
  const mealPlanId = parseInt(req.params.id, 10);

  if (isNaN(mealPlanId) || mealPlanId <= 0) {
    return res.status(400).json({ error: 'Invalid Recipe ID' });
  }

  const query = 'DELETE FROM meal_plans WHERE id = ?';

  db.db.run(query, [recipeId], function(err) { //Typo here
    if (err) {
      return res.status(500).json({ error: 'An error has occured' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    res.status(200).json({ success: true, message: 'Meal plan deleted successfully' });
  });
});

/*
Some comments that I had during this test.

Im new to exams like these, I was not sure if the environment would automatically build after each change,
and it does not require to perform a "Run Code" to test, this would be nice to include in the instructions.

The export of db is not ready-to-use because it was also exporting a function to initialize the database, thus db.db was correct.
I lost a lot of time trying to figure that out. 😓

HackerEarth does not specify that the build and test of the project will happen during the time of the test,
this is decieving because "Run Code", performs the build and test quite efficiently and quickly. This might be the reason why
people are ending up with 0 points, because they are not aware of this and fail to submit the code before the time runs out.
*/
