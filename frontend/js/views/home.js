export default function home() {
  return `
  <!-- Modern Navbar -->
  <nav class="home-navbar" id="home-navbar">
    <div class="navbar-container">
      <a class="navbar-brand" data-route="home" href="#/home">
        <span>LearnPoint</span>
      </a>
      
      <div class="navbar-nav">
        <a href="#about" class="nav-link">About</a>
        <a href="#features" class="nav-link">Features</a>
        <div class="nav-buttons">
          <a data-route="login" href="#/login" class="nav-btn login">Login</a>
          <a data-route="register" href="#/register" class="nav-btn register">Get Started</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Modern Hero -->
  <section class="home-hero" id="home">
    <div class="hero-content">
    <h1>Welcome to</h1>
    <img src="./assets/images/logo.png"alt="" width="400" height="400">
      <h2>Your space to learn and grow with expert tutors</h2>
      <a data-route="register" href="#/register" class="hero-cta">Start Learning Today</a>
    </div>
    
    <!-- Globe Animation -->
    <div class="globe-container">
      <div class="globe">
        <div class="globe-dots">
          <div class="globe-dot"></div>
          <div class="globe-dot"></div>
          <div class="globe-dot"></div>
          <div class="globe-dot"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="home-section" style="background: #f7fafc;">
    <div class="section-container">
      <h2 class="section-title">About Us</h2>
      <p class="section-subtitle">
        We connect students with passionate tutors so they can learn, build projects, 
        and grow together in the world of software development.
      </p>
      <p class="section-subtitle">
        At LearnPoint, we believe in learning by doing. We bring you tutors 
        that guide you step by step in web, mobile, data, cloud and more.
      </p>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="home-section">
    <div class="section-container">
      <h2 class="section-title">Learn Programming Languages</h2>
      <p class="section-subtitle">Master the most in-demand technologies</p>

      <div class="tech-grid">
        <div class="tech-card">
          <i class="devicon-html5-plain colored"></i>
          <p>HTML5</p>
        </div>
        <div class="tech-card">
          <i class="devicon-css3-plain colored"></i>
          <p>CSS3</p>
        </div>
        <div class="tech-card">
          <i class="devicon-javascript-plain colored"></i>
          <p>JavaScript</p>
        </div>
        <div class="tech-card">
          <i class="devicon-python-plain colored"></i>
          <p>Python</p>
        </div>
        <div class="tech-card">
          <i class="devicon-java-plain colored"></i>
          <p>Java</p>
        </div>
        <div class="tech-card">
          <i class="devicon-react-original colored"></i>
          <p>React</p>
        </div>
      </div>
    </div>
  </section>
  `;
}