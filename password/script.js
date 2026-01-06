/**
 * ============================================
 * GÉNÉRATEUR DE MOT DE PASSE
 * Architecture modulaire avec séparation des responsabilités
 * ============================================
 */

// ============================================
// CONSTANTES
// ============================================
const CHARACTER_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const STRENGTH_LEVELS = {
    weak: { text: 'Faible', class: 'weak', minLength: 0 },
    medium: { text: 'Moyen', class: 'medium', minLength: 8 },
    strong: { text: 'Fort', class: 'strong', minLength: 12 }
};

// ============================================
// ÉLÉMENTS DOM
// ============================================
const elements = {
    passwordOutput: document.getElementById('passwordOutput'),
    copyButton: document.getElementById('copyButton'),
    generateButton: document.getElementById('generateButton'),
    lengthSlider: document.getElementById('lengthSlider'),
    lengthValue: document.getElementById('lengthValue'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    strengthBar: document.getElementById('strengthBar'),
    strengthText: document.getElementById('strengthText'),
    notification: document.getElementById('notification')
};

// ============================================
// UTILITAIRES
// ============================================
const utils = {
    /**
     * Génère un nombre aléatoire entre min et max (inclus)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Mélange un tableau de manière aléatoire (algorithme Fisher-Yates)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Affiche une notification temporaire
     */
    showNotification(message, duration = 3000) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, duration);
    },

    /**
     * Copie du texte dans le presse-papiers
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }
};

// ============================================
// GÉNÉRATION DE MOT DE PASSE
// ============================================
const passwordGenerator = {
    /**
     * Récupère les caractères disponibles selon les options sélectionnées
     */
    getAvailableCharacters() {
        let characters = '';

        if (elements.uppercase.checked) {
            characters += CHARACTER_SETS.uppercase;
        }
        if (elements.lowercase.checked) {
            characters += CHARACTER_SETS.lowercase;
        }
        if (elements.numbers.checked) {
            characters += CHARACTER_SETS.numbers;
        }
        if (elements.symbols.checked) {
            characters += CHARACTER_SETS.symbols;
        }

        return characters;
    },

    /**
     * Vérifie si au moins une option est sélectionnée
     */
    hasValidOptions() {
        return elements.uppercase.checked ||
               elements.lowercase.checked ||
               elements.numbers.checked ||
               elements.symbols.checked;
    },

    /**
     * Génère un mot de passe sécurisé
     */
    generate(length) {
        const availableChars = this.getAvailableCharacters();

        if (!availableChars) {
            throw new Error('Veuillez sélectionner au moins une option');
        }

        // Garantir au moins un caractère de chaque type sélectionné
        let password = '';
        const selectedSets = [];

        if (elements.uppercase.checked) {
            const char = CHARACTER_SETS.uppercase[utils.randomInt(0, CHARACTER_SETS.uppercase.length - 1)];
            password += char;
            selectedSets.push(CHARACTER_SETS.uppercase);
        }
        if (elements.lowercase.checked) {
            const char = CHARACTER_SETS.lowercase[utils.randomInt(0, CHARACTER_SETS.lowercase.length - 1)];
            password += char;
            selectedSets.push(CHARACTER_SETS.lowercase);
        }
        if (elements.numbers.checked) {
            const char = CHARACTER_SETS.numbers[utils.randomInt(0, CHARACTER_SETS.numbers.length - 1)];
            password += char;
            selectedSets.push(CHARACTER_SETS.numbers);
        }
        if (elements.symbols.checked) {
            const char = CHARACTER_SETS.symbols[utils.randomInt(0, CHARACTER_SETS.symbols.length - 1)];
            password += char;
            selectedSets.push(CHARACTER_SETS.symbols);
        }

        // Remplir le reste avec des caractères aléatoires
        for (let i = password.length; i < length; i++) {
            const randomChar = availableChars[utils.randomInt(0, availableChars.length - 1)];
            password += randomChar;
        }

        // Mélanger le mot de passe pour éviter les patterns prévisibles
        password = utils.shuffleArray(password.split('')).join('');

        return password;
    },

    /**
     * Calcule la force du mot de passe
     */
    calculateStrength(password) {
        if (!password || password.length === 0) {
            return STRENGTH_LEVELS.weak;
        }

        let score = 0;

        // Longueur
        if (password.length >= 12) score += 2;
        else if (password.length >= 8) score += 1;

        // Diversité des caractères
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);

        const diversityCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
        score += diversityCount;

        // Déterminer le niveau
        if (score >= 5 && password.length >= 12) {
            return STRENGTH_LEVELS.strong;
        } else if (score >= 3 && password.length >= 8) {
            return STRENGTH_LEVELS.medium;
        } else {
            return STRENGTH_LEVELS.weak;
        }
    }
};

// ============================================
// GESTION DE L'INTERFACE
// ============================================
const ui = {
    /**
     * Met à jour l'affichage du mot de passe
     */
    updatePasswordDisplay(password) {
        elements.passwordOutput.value = password;
        elements.passwordOutput.classList.add('generated');
        
        setTimeout(() => {
            elements.passwordOutput.classList.remove('generated');
        }, 300);
    },

    /**
     * Met à jour l'indicateur de force
     */
    updateStrengthIndicator(password) {
        const strength = passwordGenerator.calculateStrength(password);
        
        // Réinitialiser les classes
        elements.strengthBar.className = 'strength-bar';
        
        // Ajouter la classe appropriée
        if (strength.class) {
            elements.strengthBar.classList.add(strength.class);
        }
        
        // Mettre à jour le texte
        elements.strengthText.textContent = `Force: ${strength.text}`;
    },

    /**
     * Met à jour la valeur de longueur affichée
     */
    updateLengthValue(value) {
        elements.lengthValue.textContent = value;
    },

    /**
     * Anime le bouton de génération
     */
    animateGenerateButton() {
        elements.generateButton.classList.add('generating');
        setTimeout(() => {
            elements.generateButton.classList.remove('generating');
        }, 500);
    },

    /**
     * Anime le bouton de copie
     */
    animateCopyButton() {
        elements.copyButton.classList.add('copied');
        const originalText = elements.copyButton.querySelector('.copy-text').textContent;
        elements.copyButton.querySelector('.copy-text').textContent = 'Copié!';
        
        setTimeout(() => {
            elements.copyButton.classList.remove('copied');
            elements.copyButton.querySelector('.copy-text').textContent = originalText;
        }, 2000);
    }
};

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================
const eventHandlers = {
    /**
     * Gère la génération du mot de passe
     */
    handleGenerate() {
        try {
            if (!passwordGenerator.hasValidOptions()) {
                utils.showNotification('⚠️ Veuillez sélectionner au moins une option', 3000);
                return;
            }

            const length = parseInt(elements.lengthSlider.value);
            const password = passwordGenerator.generate(length);

            ui.animateGenerateButton();
            ui.updatePasswordDisplay(password);
            ui.updateStrengthIndicator(password);
        } catch (error) {
            utils.showNotification(`❌ Erreur: ${error.message}`, 3000);
        }
    },

    /**
     * Gère la copie du mot de passe
     */
    async handleCopy() {
        const password = elements.passwordOutput.value;

        if (!password || password === 'Votre mot de passe apparaîtra ici') {
            utils.showNotification('⚠️ Aucun mot de passe à copier', 2000);
            return;
        }

        const success = await utils.copyToClipboard(password);

        if (success) {
            ui.animateCopyButton();
            utils.showNotification('✅ Mot de passe copié!', 2000);
        } else {
            utils.showNotification('❌ Erreur lors de la copie', 2000);
        }
    },

    /**
     * Gère le changement de longueur
     */
    handleLengthChange() {
        const value = elements.lengthSlider.value;
        ui.updateLengthValue(value);
        
        // Générer automatiquement un nouveau mot de passe si un existe déjà
        if (elements.passwordOutput.value && 
            elements.passwordOutput.value !== 'Votre mot de passe apparaîtra ici') {
            eventHandlers.handleGenerate();
        }
    },

    /**
     * Gère le changement d'options
     */
    handleOptionChange() {
        // Vérifier qu'au moins une option est sélectionnée
        if (!passwordGenerator.hasValidOptions()) {
            return;
        }

        // Générer automatiquement un nouveau mot de passe si un existe déjà
        if (elements.passwordOutput.value && 
            elements.passwordOutput.value !== 'Votre mot de passe apparaîtra ici') {
            eventHandlers.handleGenerate();
        }
    }
};

// ============================================
// INITIALISATION
// ============================================
const init = () => {
    // Événements du slider
    elements.lengthSlider.addEventListener('input', eventHandlers.handleLengthChange);

    // Événements des options
    elements.uppercase.addEventListener('change', eventHandlers.handleOptionChange);
    elements.lowercase.addEventListener('change', eventHandlers.handleOptionChange);
    elements.numbers.addEventListener('change', eventHandlers.handleOptionChange);
    elements.symbols.addEventListener('change', eventHandlers.handleOptionChange);

    // Événement du bouton de génération
    elements.generateButton.addEventListener('click', eventHandlers.handleGenerate);

    // Événement du bouton de copie
    elements.copyButton.addEventListener('click', eventHandlers.handleCopy);

    // Générer un mot de passe initial
    eventHandlers.handleGenerate();

    // Raccourci clavier: Espace pour générer, Ctrl+C pour copier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            eventHandlers.handleGenerate();
        }
    });
};

// ============================================
// DÉMARRAGE DE L'APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);

