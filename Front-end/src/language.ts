// Import translations
import { translations } from './translations';

// Language management
export type Language = 'en' | 'fr' | 'es';

// Current language (default to browser language or 'en')
let currentLanguage: Language = (() => {
  const savedLang = localStorage.getItem('preferredLanguage') as Language | null;
  if (savedLang) return savedLang;
  
  const browserLang = navigator.language.split('-')[0] as Language;
  return browserLang === 'fr' || browserLang === 'es' ? browserLang : 'en';
})();

// Update all text elements in the UI
export function updateUITexts(): void {
  try {
    console.log(`[i18n] Updating UI texts (current language: ${currentLanguage})`);
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`[i18n] Found ${elements.length} elements with data-i18n attribute`);
    
    if (elements.length === 0) {
      console.warn('[i18n] No elements with data-i18n attribute found. Make sure your HTML elements have the data-i18n attribute.');
      // Try to find where the elements are in the DOM
      console.log('[i18n] Checking for elements in the DOM...');
      const app = document.getElementById('app');
      if (app) {
        console.log('[i18n] App content:', app.innerHTML);
      }
    }
    
    elements.forEach((el, index) => {
      const key = el.getAttribute('data-i18n');
      const currentContent = el.textContent || '';
      console.log(`[i18n] Processing element ${index + 1}/${elements.length}:`, {
        tag: el.tagName,
        key,
        currentContent: currentContent.substring(0, 50) + (currentContent.length > 50 ? '...' : '')
      });
      
      if (key) {
        try {
          const text = t(key);
          console.log(`[i18n] Translation for '${key}':`, text);
          
          if (el.tagName === 'INPUT' && 'placeholder' in el) {
            (el as HTMLInputElement).placeholder = text;
            console.log(`[i18n] Updated input placeholder with key '${key}'`);
          } else if (el.tagName === 'IMG' && 'alt' in el) {
            (el as HTMLImageElement).alt = text;
            console.log(`[i18n] Updated image alt with key '${key}'`);
          } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
            // Handle buttons and links that might have HTML content
            const hasHtml = /<[a-z][\s\S]*>/i.test(text);
            if (hasHtml) {
              el.innerHTML = text;
              console.log(`[i18n] Updated button/link innerHTML with key '${key}'`);
            } else {
              el.textContent = text;
              console.log(`[i18n] Updated button/link text with key '${key}'`);
            }
          } else {
            el.textContent = text;
            console.log(`[i18n] Updated element text with key '${key}'`);
          }
          
          console.log(`[i18n] Successfully updated element with key '${key}':`, el);
        } catch (error) {
          console.error(`[i18n] Error updating element with key '${key}':`, error);
          console.error('[i18n] Element details:', {
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            parentNode: el.parentNode?.nodeName
          });
        }
      } else {
        console.warn('[i18n] Empty data-i18n attribute found on element:', el);
      }
    });
    
    // Also update the page title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleKey = titleElement.getAttribute('data-i18n');
      if (titleKey) {
        titleElement.textContent = t(titleKey);
      }
    }
    
    // Update placeholders separately
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && 'placeholder' in el) {
        (el as HTMLInputElement).placeholder = t(key);
      }
    });
    
    // Update title if it has a data-i18n attribute
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const titleKey = titleEl.getAttribute('data-i18n');
      if (titleKey) {
        document.title = t(titleKey);
      }
    }
    
    console.log('UI texts updated successfully');
  } catch (error) {
    console.error('Error updating UI texts:', error);
  }
}

// Translation function with enhanced debugging
export const t = (key: string, defaultValue: string = ''): string => {
  try {
    if (!key) {
      console.warn('[i18n] Empty translation key provided');
      return defaultValue || key || '';
    }
    
    // Get translations for current language
    const langData = translations[currentLanguage];
    if (!langData) {
      console.error(`[i18n] No translations found for language: ${currentLanguage}`);
      return defaultValue || key;
    }
    
    // Try direct key lookup first
    if (key in langData) {
      const translation = langData[key as keyof typeof langData];
      if (translation === undefined || translation === null) {
        console.warn(`[i18n] Empty translation for key: ${key}`);
        return defaultValue || key;
      }
      return String(translation);
    }
    
    // Try nested keys with dot notation
    const keys = key.split('.');
    let value: any = langData;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Try to find a similar key as a fallback
        const similarKey = Object.keys(langData).find(k => k.toLowerCase() === key.toLowerCase());
        if (similarKey) {
          console.warn(`[i18n] Using similar key '${similarKey}' for '${key}'`);
          return String(langData[similarKey as keyof typeof langData]);
        }
        
        console.warn(`[i18n] Translation key not found: '${key}' (language: ${currentLanguage})`);
        console.log(`[i18n] Available keys in ${currentLanguage}:`, Object.keys(langData));
        return defaultValue || key;
      }
    }
    
    if (value === undefined || value === null) {
      console.warn(`[i18n] Empty translation for key: ${key}`);
      return defaultValue || key;
    }
    
    return String(value);
  } catch (error) {
    console.error(`[i18n] Error getting translation for key '${key}':`, error);
    return defaultValue || key;
  }
}

// Create language confirmation modal
function createLanguageModal(lang: Language, callback: (savePreference: boolean) => void): void {
  // Remove existing modal if any
  const existingModal = document.getElementById('language-confirm-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'language-confirm-modal';
  modal.className = 'language-confirm-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'language-confirm-title');
  modal.setAttribute('aria-modal', 'true');

  const langName = {
    en: 'English',
    fr: 'Français',
    es: 'Español'
  }[lang];

  modal.innerHTML = `
    <div class="language-confirm-content">
      <h3 id="language-confirm-title" data-i18n="language_confirm_title">Change language to ${langName}?</h3>
      <p data-i18n="language_confirm_message">Would you like to save this as your preferred language?</p>
      <div class="language-confirm-buttons">
        <button class="btn btn-secondary" id="language-confirm-no" data-i18n="no_thanks">No thanks</button>
        <button class="btn btn-primary" id="language-confirm-yes" data-i18n="yes_save">Yes, save preference</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const yesBtn = document.getElementById('language-confirm-yes');
  const noBtn = document.getElementById('language-confirm-no');
  
  if (yesBtn && noBtn) {
    yesBtn.onclick = () => {
      modal.remove();
      callback(true);
    };
    
    noBtn.onclick = () => {
      modal.remove();
      callback(false);
    };
  }

  // Close on click outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
      callback(false);
    }
  };

  // Close on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove();
      callback(false);
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}

// Change language
export function setLanguage(lang: Language): void {
  if (lang === currentLanguage) return;
  
  // Create and show confirmation modal
  createLanguageModal(lang, (savePreference) => {
    console.log(`[i18n] Changing language to: ${lang}`, { savePreference });
    
    if (savePreference) {
      localStorage.setItem('preferredLanguage', lang);
      showLanguageFeedback(t('language_preference_saved'));
    } else {
      showLanguageFeedback(t('language_changed'));
    }
    
    // Update current language
    currentLanguage = lang;
    
    // Force update the language switcher's selected value
    const select = document.querySelector('.language-select') as HTMLSelectElement;
    if (select) {
      select.value = lang;
    }
    
    // Update all UI texts
    updateUITexts();
    
    // Dispatch event for other components to listen to
    const event = new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    });
    document.dispatchEvent(event);
    
    console.log(`[i18n] Language changed to: ${lang}`);
  });
}

// Show feedback message
function showLanguageFeedback(message: string): void {
  // Remove existing feedback if any
  const existingFeedback = document.querySelector('.language-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'language-feedback';
  feedback.textContent = message;
  
  document.body.appendChild(feedback);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    feedback.classList.add('fade-out');
    setTimeout(() => feedback.remove(), 300);
  }, 3000);
}

// Language options with flags and names
const LANGUAGES: {code: Language, name: string, flag: string}[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

// Create language switcher HTML
export function createLanguageSwitcher(): HTMLDivElement {
  console.log('[i18n] Creating language switcher...');
  
  const container = document.createElement('div');
  container.className = 'language-switcher';
  console.log('[i18n] Created container:', container);
  
  const select = document.createElement('select');
  select.className = 'language-select';
  select.setAttribute('aria-label', 'Select language');
  select.title = 'Select language';
  select.tabIndex = 0;
  
  console.log('[i18n] Adding language options...');
  // Add language options with flags
  LANGUAGES.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = `${lang.flag} ${lang.name}`;
    select.appendChild(option);
  });
  
  // Set the current language
  select.value = currentLanguage;
  
  // Add change event listener
  select.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const newLang = target.value as Language;
    console.log(`[i18n] Language changed to: ${newLang}`);
    setLanguage(newLang);
  });
  
  container.appendChild(select);
  console.log('[i18n] Language switcher created:', container);
  return container;
}

// Handle language change
function handleLanguageChange(e: Event) {
  const select = e.target as HTMLSelectElement;
  const newLang = select.value as Language;
  setLanguage(newLang);
}

// Update all language selectors when language changes
document.addEventListener('languageChanged', () => {
  const selects = document.querySelectorAll<HTMLSelectElement>('.language-select');
  selects.forEach(select => {
    if (select.value !== currentLanguage) {
      select.value = currentLanguage;
    }
  });
});

// Initialize language functionality
export function initLanguage(): void {
  try {
    console.log('[i18n] Initializing language system...');
    
    // Add a style tag to the head to ensure our styles take precedence
    const style = document.createElement('style');
    style.textContent = `
      .language-select,
      .language-select:focus,
      .language-select:active,
      .language-select:hover,
      .language-switcher,
      .language-switcher-container,
      #language-switcher-container,
      #language-switcher-container * {
        border-color: rgba(255, 255, 255, 0.2) !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      select.language-select {
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 12px center !important;
        background-size: 12px !important;
        padding-right: 30px !important;
      }
    `;
    document.head.appendChild(style);
    
    // Set up event listeners for language changes
    setupLanguageEventListeners();
    
    // Function to initialize the language switcher
    const initializeSwitcher = (): boolean => {
      console.log('[i18n] Looking for language switcher container...');
      const container = document.getElementById('language-switcher-container');
      
      if (!container) {
        console.error('[i18n] Language switcher container not found!');
        return false;
      }
      
      console.log('[i18n] Found container, checking parent:', container.parentElement);
      
      // Create the language switcher
      const switcher = createLanguageSwitcher();
      
      // Clear any existing content and add the new switcher
      container.innerHTML = '';
      container.appendChild(switcher);
      
      // Make sure the container is visible
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      
      // Add debug styles
      container.style.border = '1px solid #00ff00';
      container.style.padding = '5px';
      container.style.borderRadius = '4px';
      
      // Find the select element we just created
      const select = container.querySelector('select.language-select') as HTMLSelectElement;
      if (!select) {
        console.error('[i18n] Failed to create select element!');
        return false;
      }
      
      // Set the initial selected value and add change handler
      select.value = currentLanguage;
      select.setAttribute('data-initialized', 'true');
      
      // Add change event listener
      select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const newLang = target.value as Language;
        console.log(`[i18n] Language changed to: ${newLang}`);
        setLanguage(newLang);
      });
      
      console.log('[i18n] Language switcher initialized successfully');
      return true;
    };
    
    // Try to initialize immediately
    if (!initializeSwitcher()) {
      // If it fails, try again after a short delay to ensure DOM is ready
      console.log('[i18n] Retrying language switcher initialization...');
      setTimeout(() => {
        if (!initializeSwitcher()) {
          console.error('[i18n] Failed to initialize language switcher after retry');
        }
      }, 500);
    }
  } catch (error) {
    console.error('[i18n] Error initializing language system:', error);
  }
}

// Create a fallback language switcher in case the main one fails
export function createFallbackLanguageSwitcher(): void {
  console.warn('[i18n] Creating fallback language switcher...');
  const fallbackContainer = document.createElement('div');
  fallbackContainer.id = 'language-switcher-fallback';
  fallbackContainer.className = 'language-switcher-container';
  fallbackContainer.style.position = 'fixed';
  fallbackContainer.style.top = '10px';
  fallbackContainer.style.right = '10px';
  fallbackContainer.style.zIndex = '9999';
  fallbackContainer.style.padding = '10px';
  fallbackContainer.style.background = '#1a1a2e';
  fallbackContainer.style.border = '1px solid #00e6ff';
  fallbackContainer.style.borderRadius = '4px';
  
  const select = document.createElement('select');
  select.className = 'language-select';
  select.style.padding = '5px';
  select.style.borderRadius = '4px';
  select.style.border = '1px solid #00e6ff';
  select.style.background = '#1a1a2e';
  select.style.color = 'white';
  
  LANGUAGES.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = `${lang.flag} ${lang.name}`;
    select.appendChild(option);
  });
  
  select.value = currentLanguage;
  select.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newLang = target.value as Language;
    console.log(`[i18n] Language changed to: ${newLang}`);
    setLanguage(newLang);
  });
  
  fallbackContainer.appendChild(select);
  document.body.appendChild(fallbackContainer);
  console.log('[i18n] Fallback language switcher created');
}

// Set up event listeners for language changes
function setupLanguageEventListeners(): void {
  // Remove any existing listeners to prevent duplicates
  window.removeEventListener('popstate', updateUITexts);
  document.removeEventListener('languageChanged', updateUITexts);
  
  // Listen for route changes to update translations
  window.addEventListener('popstate', updateUITexts);
  
  // Listen for custom language change events
  document.addEventListener('languageChanged', updateUITexts);
  
  // Initial UI update with a small delay to ensure all elements are rendered
  setTimeout(() => {
    console.log('[i18n] Performing initial UI update...');
    updateUITexts();
    
    // Double-check the language switcher value
    const select = document.querySelector('.language-select') as HTMLSelectElement;
    if (select && select.value !== currentLanguage) {
      console.log(`[i18n] Correcting language switcher value to: ${currentLanguage}`);
      select.value = currentLanguage;
    }
  }, 300); // Increased delay for better reliability
  
  console.log('[i18n] Language system initialized');
}


// Export current language
export { currentLanguage };
