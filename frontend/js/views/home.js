export default function home() {
  return `
  <!-- Navbar -->
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" data-route="home" href="#/home">
        <img src="./assets/images/page_logo.png" width="30" height="30" alt="LearnPoint logo">
        <span class="ml-2 has-text-weight-bold has-text-white">LearnPoint</span>
      </a>

      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasic">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasic" class="navbar-menu">
      <div class="navbar-end">
        <a href="#about" class="nav-btn navbar-item">About</a>
        <a href="#features" class="nav-btn navbar-item">Features</a>
        <a data-route="login" href="#/login" class="button navbar-item login-btn">Login</a>
        <a data-route="register" href="#/register" class="button navbar-item register-btn">Register</a>
      </div>
    </div>
  </nav>
  <!-- Hero / Home -->
  <section class="hero is-fullheight" id="home">
    <div class="hero-body has-text-centered">
      <div class="content-box">

        <h1 class="title">Welcome to </h1>

        <img src="./assets/images/logo.png" alt="LearnPoint Logo" class="hero-logo">
        
        <h2 class="subtitle">Your space to learn and grow</h2>
        <a data-route="register" href="#/register" class="button is-primary">Get Started</a>
      </div>
      <div class="globe-animation" id="globe-animation" aria-hidden="true"></div>
    </div>
  </section>

  <section id="about" class="section has-background-light">
    <div class="container about-home">
      <h2 class="title">About Us</h2>
      <div class="home-text">
        <p class="subtitle">
          We are a project created by coders from Riwi, with the mission of transforming the way students and tutors connect. At LearnPoint, we believe that learning is not just about studying  it’s about living the experience: sharing, creating, and growing together in the world of software.

          Our platform provides you with an authentic and high-quality connection, where every tutor shares their passion and every student finds the perfect opportunity to boost their future.
        </p>
        <p class="subtitle">
          At LearnPoint, we believe in learning by doing. We bring you tutors 
          that guide you step by step in web, mobile, data, cloud and more.
        </p>
      </div> 
    </div>
  </section>


  <section id="features" class="section has-background-light features-home">
    <div class="container has-text-centered">
      <h2 class="title">Learn Programming Languages</h2>
      <p class="subtitle">Master the most in-demand technologies</p>

      <div class="cards-container">
        <div class="card-tech">
          <i class="devicon-html5-plain colored"></i>
          <p>HTML5</p>
        </div>
        <div class="card-tech">
          <i class="devicon-css3-plain colored"></i>
          <p>CSS3</p>
        </div>
        <div class="card-tech">
          <i class="devicon-javascript-plain colored"></i>
          <p>JavaScript</p>
        </div>
        <div class="card-tech">
          <i class="devicon-python-plain colored"></i>
          <p>Python</p>
        </div>
        <div class="card-tech">
          <i class="devicon-java-plain colored"></i>
          <p>Java</p>
        </div>
        <div class="card-tech">
          <i class="devicon-react-original colored"></i>
          <p>React</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="content has-text-centered">
      <p>&copy; 2025 LearnPoint. All rights reserved.</p>
    </div>
  </footer>
  `;
}
