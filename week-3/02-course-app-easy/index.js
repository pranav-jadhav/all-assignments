const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.user = user; 
    next();
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
};

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const ifAdminExists = ADMINS.find(a => a.username === admin.username);
  if(ifAdminExists){
    res.status(403).json({ message: 'Admin already exists'});
  } else{
    ADMINS.push(admin);
    res.status(403).json({ message: 'Admin created successfully'});
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({ message: 'Logged in successfully' });
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  if(!course.title){
    return res.status(411).json({ message: 'Please send Title' });
  }
  course.id = Date.now(); // use timestamp as course ID
  COURSES.push(course);
  res.json({ message: 'Course created successfully', courseId: course.id });
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  // logic to edit a course
  const course = COURSES.find(c => c.id === parseInt(req.params.courseId));
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({ courses: COURSES });
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: []
  }
  USERS.push(user);
  res.json({ message: 'User created successfully' });
});

app.post('/users/login', userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses', userAuthentication, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES.filter(c => c.published) });
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  // logic to view purchased courses
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});





