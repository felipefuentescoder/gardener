export function generateLandingPage(businessData, theme) {
  const {
    businessName,
    contact,
    serviceArea,
    services,
    experience,
    certifications
  } = businessData || {}

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName || 'Gardening Services'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${theme.text};
      background: ${theme.background};
    }
    .header {
      background: ${theme.primary};
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    .nav {
      background: ${theme.secondary};
      padding: 15px 20px;
      text-align: center;
    }
    .nav a {
      color: white;
      text-decoration: none;
      margin: 0 15px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .section {
      margin-bottom: 50px;
    }
    .section h2 {
      color: ${theme.primary};
      margin-bottom: 20px;
      font-size: 1.8em;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .service-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .contact-info {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .contact-info p {
      margin-bottom: 10px;
    }
    .cta-button {
      display: inline-block;
      background: ${theme.primary};
      color: white;
      padding: 15px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 1.1em;
      margin-top: 15px;
    }
    footer {
      background: ${theme.primary};
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${businessName || 'Professional Gardening Services'}</h1>
    <p>${serviceArea ? 'Serving ' + serviceArea : 'Quality Gardening Services'}</p>
  </header>

  <nav class="nav">
    <a href="#services">Services</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
  </nav>

  <div class="container">
    <section class="section" id="services">
      <h2>Our Services</h2>
      ${services && services.length > 0 ? '<div class="services-grid">' + services.map(s => '<div class="service-card">' + s + '</div>').join('') + '</div>' : '<p>Contact us to learn about our services.</p>'}
    </section>

    <section class="section" id="about">
      <h2>About Us</h2>
      ${experience ? '<p><strong>Experience:</strong> ' + experience + '</p>' : ''}
      ${certifications ? '<p><strong>Certifications:</strong> ' + certifications + '</p>' : ''}
    </section>

    <section class="section" id="contact">
      <h2>Contact Us</h2>
      <div class="contact-info">
        ${contact?.phone ? '<p><strong>Phone:</strong> ' + contact.phone + '</p>' : ''}
        ${contact?.email ? '<p><strong>Email:</strong> ' + contact.email + '</p>' : ''}
        ${contact?.address ? '<p><strong>Address:</strong> ' + contact.address + '</p>' : ''}
        ${contact?.phone ? '<a href="tel:' + contact.phone + '" class="cta-button">Call Now</a>' : ''}
      </div>
    </section>
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${businessName || 'Gardening Services'}</p>
  </footer>
</body>
</html>
`
  return html
}