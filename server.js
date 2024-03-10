const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const fetch = require('node-fetch'); 

const app = express();

mongoose.connect('mongodb+srv://daniil228367:1234@cluster5.04edy86.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to users MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});



app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'templates'));


app.set('view engine', 'ejs');
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  age: Number,
  country: String,  
  gender: String,
  role: { type: String, enum: ['client', 'admin'], default: 'client' }
});

const User = mongoose.model('User', userSchema);

app.get('/admin', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.session.username });
    if (user && user.role === 'admin') {
      
      const carouselItems = await CarouselItem.find();
      res.render('admin.ejs', { username: req.session.username, carouselItems: carouselItems });
    } else {
      res.status(401).send('YOU ARE NOT THE ADMINISTRATOR');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});




app.get('/', async (req, res) => {
  try {
      const carouselItems = await CarouselItem.find();
      const username = req.session.username; 
      res.render('index.ejs', { carouselData: carouselItems, username: username });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching carousel items');
  }
});

app.get('/news', (req, res) => {
  res.render('news.ejs'); 
});

app.get('/weather', (req, res) => {
  res.render('weather.ejs'); 
});


app.get('/login', (req, res) => {
    res.render('login.ejs'); 
  });
  

  app.post('/register', async (req, res) => {
    try {
      const { firstName, lastName, age, country, username, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        age,
        country,
        role: 'client'
      });
  
      await user.save();
  
      console.log('User registered successfully:', user); 
  
      
      req.session.username = username;
  
      
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error registering user');
    }
  });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                
                req.session.username = username;
                res.redirect('/');
                return;
            } else {
                res.status(401).send('Invalid username or password');
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during login');
    }
});

mongoose.connect('mongodb+srv://daniil228367:1234@cluster5.04edy86.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to carousel MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});





const carouselItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  photoUrl: String, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CarouselItem = mongoose.model('CarouselItem', carouselItemSchema);

app.post('/carouselItems', async (req, res) => {
  try {
    const { name, description, photoUrl } = req.body;
    const carouselItem = new CarouselItem({ 
      name, 
      description, 
      photoUrl, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    });
    await carouselItem.save();
    res.status(201).send(carouselItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating carousel item');
  }
});



app.get('/carouselItems', async (req, res) => {
  try {
      const carouselItems = await CarouselItem.find();
      res.send(carouselItems);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching carousel items');
  }
});


app.get('/carouselItems/:id', async (req, res) => {
  try {
      const itemId = req.params.id;
      const carouselItem = await CarouselItem.findById(itemId);
      if (!carouselItem) {
          return res.status(404).send('Item not found');
      }
      res.json(carouselItem);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching carousel item by ID');
  }
});


app.put('/carouselItems/:id', async (req, res) => {
  try {
      const { name, description, photoUrl } = req.body;
      const updatedItem = await CarouselItem.findByIdAndUpdate(req.params.id, 
          { 
              name, 
              description, 
              photoUrl,
              updatedAt: Date.now() 
          },
          { new: true }
      );
      res.send(updatedItem);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating carousel item');
  }
});


app.delete('/carouselItems/:id', async (req, res) => {
  try {
      await CarouselItem.findByIdAndDelete(req.params.id);
      res.send('Carousel item deleted successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting carousel item');
  }
}); 






  const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
