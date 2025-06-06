module.exports = {
  // Default browser settings
  headless: false,
  
  // TutorBird login credentials
  login: {
    url: 'https://app.tutorbird.com/',
    email: 'vmotiv8llc@gmail.com',
    password: 'VMotiv8!',
    emailSelector: '#MainContent_contentBody_textboxEmail',
    passwordSelector: '#MainContent_contentBody_textboxPassword'
  },
  
  // File paths for persistence
  cookiesFile: './cookies.json',
  
  // Server settings
  port: 3000
};