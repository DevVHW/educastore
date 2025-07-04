class LoginFormComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['form-type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const formType = this.getAttribute('form-type') || 'login';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('/components/LoginForm/login-form-component.css');
      </style>
      <div class="login-container">
        <div class="login-box">
          <div class="logo-container">
            <img src="/images/logo.png" alt="EducaStore" class="logo" />
            <h1>${this.getTitle(formType)}</h1>
          </div>

          ${formType !== 'reset' ? this.renderSocialButtons() : ''}
          ${formType !== 'reset' ? '<hr />' : ''}

          <form class="auth-form" data-form-type="${formType}">
            ${this.renderFormFields(formType)}
            <button-component type="submit" variant="primary" size="large">${this.getButtonText(formType)}</button-component>
          </form>

          ${this.renderLinks(formType)}
          ${formType === 'reset' ? this.renderPasswordRules() : ''}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  getTitle(formType) {
    const titles = {
      'login': 'Entrar no EducaStore',
      'register': 'Cadastrar no EducaStore',
      'reset': 'Redefinir Senha'
    };
    return titles[formType] || titles.login;
  }

  getButtonText(formType) {
    const buttons = {
      'login': 'Acessar',
      'register': 'Cadastre-se',
      'reset': 'Redefinir'
    };
    return buttons[formType] || buttons.login;
  }

  renderSocialButtons() {
    return `
      <div class="social-buttons">
        <button type="button" class="social-btn google">
          <img src="/images/google.png" alt="Google">
          Conectar-se com o Google
        </button>
        <button type="button" class="social-btn facebook">
          <img src="/images/facebook.png" alt="Facebook">
          Conectar-se com o Facebook
        </button>
        <button type="button" class="social-btn apple">
          <img src="/images/apple.png" alt="Apple">
          Conectar-se com a Apple
        </button>
      </div>
    `;
  }

  renderFormFields(formType) {
    if (formType === 'register') {
      return `
        <input-component type="email" name="email" placeholder="E-mail" icon="envelope" required></input-component>
        <input-component type="text" name="username" placeholder="Usuário" icon="user" required></input-component>
        <input-component type="password" name="password" placeholder="Senha" icon="lock" required></input-component>
        <input-component type="password" name="confirmPassword" placeholder="Confirmar senha" icon="lock" required></input-component>
      `;
    } else if (formType === 'reset') {
      return `
        <input-component type="text" name="emailOrUsername" placeholder="E-mail ou usuário" icon="envelope" required></input-component>
        <input-component type="password" name="newPassword" placeholder="Nova senha" icon="lock" required></input-component>
      `;
    } else {
      return `
        <input-component type="text" name="emailOrUsername" placeholder="E-mail ou usuário" icon="envelope" required></input-component>
        <input-component type="password" name="password" placeholder="Senha" icon="lock" required></input-component>
      `;
    }
  }

  renderLinks(formType) {
    if (formType === 'login') {
      return `
        <div class="links">
          <a href="/pages/auth/reset.html">Esqueceu sua senha? <span class="link">Clique aqui</span></a>
          <a href="/pages/auth/register.html">Não tem uma conta? <span class="link">Cadastre-se</span></a>
        </div>
      `;
    } else if (formType === 'register') {
      return `
        <div class="links">
          <a href="/pages/auth/login.html">Já tem uma conta? <span class="link">Entre</span></a>
        </div>
      `;
    } else {
      return `
        <div class="links">
          <a href="/pages/auth/login.html">Voltar ao <span class="link">Login</span></a>
        </div>
      `;
    }
  }

  renderPasswordRules() {
    return `
      <div class="password-rules">
        <p>Combine letras, números e caracteres especiais.</p>
        <p>Use pelo menos 8 caracteres.</p>
        <p>Use letras maiúsculas e minúsculas.</p>
        <p>Não utilize sequência de números ou letras.</p>
      </div>
    `;
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector('.auth-form');
    const socialButtons = this.shadowRoot.querySelectorAll('.social-btn');
    const submitButton = this.shadowRoot.querySelector('button-component[type="submit"]');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e);
      });
    }

    // Listener para o botão de submit customizado
    if (submitButton) {
      submitButton.addEventListener('button-click', (e) => {
        e.preventDefault();
        const fakeEvent = { target: form };
        this.handleFormSubmit(fakeEvent);
      });
    }

    socialButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleSocialLogin(e);
      });
    });

    // Listener para validação em tempo real dos inputs
    const inputComponents = this.shadowRoot.querySelectorAll('input-component');
    inputComponents.forEach(input => {
      input.addEventListener('input-blur', () => {
        input.validate();
      });
    });
  }

  handleFormSubmit(e) {
    const formType = e.target.getAttribute('data-form-type');
    const inputComponents = this.shadowRoot.querySelectorAll('input-component');
    const data = {};

    // Coletar dados dos input components
    inputComponents.forEach(input => {
      const name = input.getAttribute('name');
      const value = input.getValue();
      if (name) {
        data[name] = value;
      }
    });

    // Validação básica
    if (!this.validateForm(data, formType)) {
      return;
    }

    // Dispatch custom event
    document.dispatchEvent(
      new CustomEvent('auth-form-submit', {
        detail: {
          formType,
          data
        }
      })
    );

    // Simular sucesso (em um caso real, isso seria uma chamada de API)
    this.showSuccess(formType, data);
  }

  validateForm(data, formType) {
    if (formType === 'register') {
      if (data.password !== data.confirmPassword) {
        alert('As senhas não coincidem!');
        return false;
      }
    }

    if (formType === 'reset') {
      if (data.newPassword.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres!');
        return false;
      }
    }

    // Verificar se todos os campos obrigatórios estão preenchidos
    for (const key in data) {
      if (!data[key]) {
        alert('Por favor, preencha todos os campos.');
        return false;
      }
    }

    return true;
  }

  showSuccess(formType, data) {
    const messages = {
      'login': `Login realizado com sucesso para: ${data.emailOrUsername}`,
      'register': `Cadastro realizado com sucesso para: ${data.email}`,
      'reset': `Senha redefinida com sucesso para: ${data.emailOrUsername}`
    };

    alert(messages[formType]);

    // Redirecionar para a página principal após login/cadastro
    if (formType === 'login' || formType === 'register') {
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
    }
  }

  handleSocialLogin(e) {
    const provider = e.currentTarget.classList.contains('google') ? 'Google' :
      e.currentTarget.classList.contains('facebook') ? 'Facebook' : 'Apple';

    alert(`Login com ${provider} ainda não implementado`);
  }
}

customElements.define('login-form-component', LoginFormComponent); 