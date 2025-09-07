import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- I18N (TRANSLATIONS) ---

const translations = {
    en: {
        // General
        brandTitle: '- 12weekyear -',
        members: 'members',
        back: 'Back',
        next: 'Next',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        week: 'Week',
        day: 'Day',
        you: 'You',
        // Auth
        login: 'Login',
        registration: 'Registration',
        email: 'Email',
        password: 'Password',
        loginButton: 'Login',
        createAccount: 'Create Account',
        noAccount: "Don't have an account?",
        register: 'Register',
        haveAccount: 'Already have an account?',
        fillAllFields: 'Please fill in all fields.',
        invalidCredentials: 'Invalid email or password.',
        userExists: 'User with this email already exists.',
        // Header
        logout: 'Logout',
        toggleTheme: 'Toggle theme',
        settings: 'Settings',
        // Home Screen
        myCycles: 'My 12-Week Cycles',
        cycleFrom: 'Cycle from',
        until: 'Until',
        goalsCount: 'goals',
        noCycles: 'You don\'t have any cycles yet. Start your first 12-week year!',
        startYear: 'Start 12-Week Year',
        friendsProgress: 'Friends\' Progress',
        friendsChat: 'Chat with Friends',
        // Onboarding
        aiThinking: 'AI assistant is thinking...',
        step1Title: 'Step 1: Start Date',
        step1Desc: 'Choose the start date for your 12-week cycle. Default is today.',
        step2Title: 'Step 2: Your 12-Week Vision',
        step2Desc: 'Who do you want to become in 12 weeks? Formulate a clear and motivating vision.',
        visionPlaceholder: 'e.g., "In 12 weeks, I will be full of energy and in great shape..."',
        aiHelp: '✨ AI Assistant Help',
        step3Title: 'Step 3: Define Main Goals',
        step3Desc: 'Define 1-5 main goals for this cycle. Less is more!',
        newGoalPlaceholder: 'New main goal',
        habitsFor: 'Habits for',
        dailyActionsPrompt: 'What daily actions will lead you to this goal?',
        newHabitPlaceholder: 'New daily habit',
        startCycle: 'Start Cycle!',
        nextGoal: 'Next Goal',
        // Dashboard
        allCycles: 'All Cycles',
        yourVision: 'Your Vision',
        editGoal: 'Edit Goal',
        editGoalAria: 'Edit goal',
        habit: 'Habit',
        noHabitsForGoal: 'No daily habits have been set for this goal.',
        weeklyReview: 'Weekly Review',
        noHabitsToRate: 'No habits to rate.',
        yourScore: 'Your Score:',
        execution: 'Execution:',
        rateHabitAria: 'Rate habit',
        notesPlaceholder: 'What went well? What can be improved?',
        exportPDF: 'Export to PDF',
        completeWeek: 'Complete Week',
        exportingPDF: 'Exporting to PDF...',
        // Modals
        editGoalTitle: 'Edit Goal',
        goalName: 'Goal Name',
        addHabit: 'Add new habit',
        overallProgress: 'Overall Progress',
        cycleSummary: 'Cycle Summary',
        detailedGrid: 'Detailed Grid',
        noHabitsToTrack: 'No habits to track.',
        // Settings
        privacySettings: 'Privacy Settings',
        whoCanSeeProgress: 'Who can see your progress?',
        allFriends: 'All friends',
        selectedFriends: 'Selected friends',
        none: 'Nobody',
        addFriendsFirst: 'Add friends first.',
        manageFriends: 'Manage Friends',
        addFriendByEmail: 'Add friend by email',
        cannotAddSelf: 'You cannot add yourself as a friend.',
        alreadyFriends: 'This user is already in your friends list.',
        userNotFound: 'User with this email not found.',
        // Friends Progress
        friendProgressTitle: "Friends' Progress",
        userNotFoundMsg: 'User not found.',
        progressIsPrivate: 'This user\'s progress is private.',
        noActiveCycles: 'The user has no active cycles.',
        noProgressData: 'No progress data yet.',
        weekCompletion: 'Week {weekNumber}: {completion}% execution',
        noFriends: 'You don\'t have any friends yet. Add them in the settings.',
        geminiPrompt: 'Help me craft a powerful vision for my 12-week year. Give me 3 inspiring example questions I can ask myself to formulate my vision. The questions should focus on personal transformation and clear goals. Respond in English.',
        pdfError: 'Failed to export to PDF.',
        visionError: 'Failed to generate help. Please try again later.',
        // Chat
        chatWithFriendsTitle: 'Chat with Friends',
        typeMessage: 'Type a message...',
        send: 'Send'
    },
    de: {
        // General
        brandTitle: '- 12weekyear -',
        members: 'Mitglieder',
        back: 'Zurück',
        next: 'Weiter',
        save: 'Speichern',
        cancel: 'Abbrechen',
        close: 'Schließen',
        week: 'Woche',
        day: 'Tag',
        you: 'Du',
        // Auth
        login: 'Anmelden',
        registration: 'Registrierung',
        email: 'E-Mail',
        password: 'Passwort',
        loginButton: 'Anmelden',
        createAccount: 'Konto erstellen',
        noAccount: 'Kein Konto?',
        register: 'Registrieren',
        haveAccount: 'Bereits ein Konto?',
        fillAllFields: 'Bitte füllen Sie alle Felder aus.',
        invalidCredentials: 'Ungültige E-Mail oder ungültiges Passwort.',
        userExists: 'Ein Benutzer mit dieser E-Mail existiert bereits.',
        // Header
        logout: 'Abmelden',
        toggleTheme: 'Theme wechseln',
        settings: 'Einstellungen',
        // Home Screen
        myCycles: 'Meine 12-Wochen-Zyklen',
        cycleFrom: 'Zyklus vom',
        until: 'Bis',
        goalsCount: 'Ziele',
        noCycles: 'Sie haben noch keine Zyklen. Starten Sie Ihr erstes 12-Wochen-Jahr!',
        startYear: '12-Wochen-Jahr beginnen',
        friendsProgress: 'Fortschritt von Freunden',
        friendsChat: 'Chat mit Freunden',
        // Onboarding
        aiThinking: 'KI-Assistent denkt nach...',
        step1Title: 'Schritt 1: Startdatum',
        step1Desc: 'Wählen Sie das Startdatum für Ihren 12-Wochen-Zyklus. Standard ist heute.',
        step2Title: 'Schritt 2: Ihre 12-Wochen-Vision',
        step2Desc: 'Wer möchten Sie in 12 Wochen sein? Formulieren Sie eine klare und motivierende Vision.',
        visionPlaceholder: 'z.B. "In 12 Wochen werde ich voller Energie und in Topform sein..."',
        aiHelp: '✨ Hilfe vom KI-Assistent',
        step3Title: 'Schritt 3: Hauptziele definieren',
        step3Desc: 'Definieren Sie 1-5 Hauptziele für diesen Zyklus. Weniger ist mehr!',
        newGoalPlaceholder: 'Neues Hauptziel',
        habitsFor: 'Gewohnheiten für',
        dailyActionsPrompt: 'Welche täglichen Handlungen führen Sie zu diesem Ziel?',
        newHabitPlaceholder: 'Neue tägliche Gewohnheit',
        startCycle: 'Zyklus starten!',
        nextGoal: 'Nächstes Ziel',
        // Dashboard
        allCycles: 'Alle Zyklen',
        yourVision: 'Ihre Vision',
        editGoal: 'Ziel bearbeiten',
        editGoalAria: 'Ziel bearbeiten',
        habit: 'Gewohnheit',
        noHabitsForGoal: 'Für dieses Ziel wurden keine täglichen Gewohnheiten festgelegt.',
        weeklyReview: 'Wochenrückblick',
        noHabitsToRate: 'Keine Gewohnheiten zu bewerten.',
        yourScore: 'Ihre Bewertung:',
        execution: 'Umsetzung:',
        rateHabitAria: 'Gewohnheit bewerten',
        notesPlaceholder: 'Was lief gut? Was kann verbessert werden?',
        exportPDF: 'Als PDF exportieren',
        completeWeek: 'Woche abschließen',
        exportingPDF: 'Exportiere nach PDF...',
        // Modals
        editGoalTitle: 'Ziel bearbeiten',
        goalName: 'Zielname',
        addHabit: 'Neue Gewohnheit hinzufügen',
        overallProgress: 'Gesamtfortschritt',
        cycleSummary: 'Zykluszusammenfassung',
        detailedGrid: 'Detailliertes Raster',
        noHabitsToTrack: 'Keine Gewohnheiten zum Verfolgen.',
        // Settings
        privacySettings: 'Datenschutzeinstellungen',
        whoCanSeeProgress: 'Wer kann Ihren Fortschritt sehen?',
        allFriends: 'Alle Freunde',
        selectedFriends: 'Ausgewählte Freunde',
        none: 'Niemand',
        addFriendsFirst: 'Fügen Sie zuerst Freunde hinzu.',
        manageFriends: 'Freunde verwalten',
        addFriendByEmail: 'Freund per E-Mail hinzufügen',
        cannotAddSelf: 'Sie können sich nicht selbst als Freund hinzufügen.',
        alreadyFriends: 'Dieser Benutzer ist bereits in Ihrer Freundesliste.',
        userNotFound: 'Benutzer mit dieser E-Mail nicht gefunden.',
        // Friends Progress
        friendProgressTitle: 'Fortschritt von Freunden',
        userNotFoundMsg: 'Benutzer nicht gefunden.',
        progressIsPrivate: 'Der Fortschritt dieses Benutzers ist privat.',
        noActiveCycles: 'Der Benutzer hat keine aktiven Zyklen.',
        noProgressData: 'Noch keine Fortschrittsdaten.',
        weekCompletion: 'Woche {weekNumber}: {completion}% Umsetzung',
        noFriends: 'Sie haben noch keine Freunde. Fügen Sie sie in den Einstellungen hinzu.',
        geminiPrompt: 'Hilf mir, eine starke Vision für mein 12-Wochen-Jahr zu entwickeln. Gib mir 3 inspirierende Beispielfragen, die ich mir stellen kann, um meine Vision zu formulieren. Die Fragen sollten sich auf persönliche Transformation und klare Ziele konzentrieren. Antworte auf Deutsch.',
        pdfError: 'Export nach PDF fehlgeschlagen.',
        visionError: 'Hilfe konnte nicht generiert werden. Bitte versuchen Sie es später erneut.',
        // Chat
        chatWithFriendsTitle: 'Chat mit Freunden',
        typeMessage: 'Nachricht schreiben...',
        send: 'Senden'
    },
    ru: {
        // General
        brandTitle: '- 12weekyear -',
        members: 'участников',
        back: 'Назад',
        next: 'Далее',
        save: 'Сохранить',
        cancel: 'Отмена',
        close: 'Закрыть',
        week: 'Неделя',
        day: 'День',
        you: 'Вы',
        // Auth
        login: 'Вход',
        registration: 'Регистрация',
        email: 'Email',
        password: 'Пароль',
        loginButton: 'Войти',
        createAccount: 'Создать аккаунт',
        noAccount: 'Нет аккаунта?',
        register: 'Зарегистрироваться',
        haveAccount: 'Уже есть аккаунт?',
        fillAllFields: 'Пожалуйста, заполните все поля.',
        invalidCredentials: 'Неверный email или пароль.',
        userExists: 'Пользователь с таким email уже существует.',
        // Header
        logout: 'Выйти',
        toggleTheme: 'Переключить тему',
        settings: 'Настройки',
        // Home Screen
        myCycles: 'Мои 12-недельные циклы',
        cycleFrom: 'Цикл от',
        until: 'До',
        goalsCount: 'цели',
        noCycles: 'У вас еще нет ни одного цикла. Начните свой первый 12-недельный год!',
        startYear: 'Начать 12-недельный год',
        friendsProgress: 'Прогресс друзей',
        friendsChat: 'Чат с друзьями',
        // Onboarding
        aiThinking: 'ИИ-ассистент думает...',
        step1Title: 'Шаг 1: Дата начала',
        step1Desc: 'Выберите дату начала вашего 12-недельного цикла. По умолчанию это сегодня.',
        step2Title: 'Шаг 2: Ваше 12-недельное видение',
        step2Desc: 'Кем вы хотите стать через 12 недель? Сформулируйте ясное и мотивирующее видение.',
        visionPlaceholder: 'Например: "Через 12 недель я буду полон энергии и в хорошей форме..."',
        aiHelp: '✨ Помощь ИИ-ассистента',
        step3Title: 'Шаг 3: Определите основные цели',
        step3Desc: 'Определите 1-5 основных целей на этот цикл. Меньше — значит больше!',
        newGoalPlaceholder: 'Новая основная цель',
        habitsFor: 'Привычки для',
        dailyActionsPrompt: 'Какие ежедневные действия приведут вас к этой цели?',
        newHabitPlaceholder: 'Новая ежедневная привычка',
        startCycle: 'Начать цикл!',
        nextGoal: 'Следующая цель',
        // Dashboard
        allCycles: 'Все циклы',
        yourVision: 'Ваше видение',
        editGoal: 'Редактировать цель',
        editGoalAria: 'Редактировать цель',
        habit: 'Привычка',
        noHabitsForGoal: 'Для этой цели не задано ежедневных привычек.',
        weeklyReview: 'Итоги недели',
        noHabitsToRate: 'Нет привычек для оценки.',
        yourScore: 'Ваша оценка:',
        execution: 'Выполнение:',
        rateHabitAria: 'Оценить привычку',
        notesPlaceholder: 'Что прошло хорошо? Что можно улучшить?',
        exportPDF: 'Экспорт в PDF',
        completeWeek: 'Завершить неделю',
        exportingPDF: 'Экспорт в PDF...',
        // Modals
        editGoalTitle: 'Редактировать цель',
        goalName: 'Название цели',
        addHabit: 'Добавить новую привычку',
        overallProgress: 'Общий прогресс',
        cycleSummary: 'Сводка по циклу',
        detailedGrid: 'Детальная сетка',
        noHabitsToTrack: 'Нет привычек для отслеживания.',
        // Settings
        privacySettings: 'Настройки приватности',
        whoCanSeeProgress: 'Кто может видеть ваш прогресс?',
        allFriends: 'Все друзья',
        selectedFriends: 'Выбранные друзья',
        none: 'Никто',
        addFriendsFirst: 'Сначала добавьте друзей.',
        manageFriends: 'Управление друзьями',
        addFriendByEmail: 'Добавить друга по email',
        cannotAddSelf: 'Вы не можете добавить себя в друзья.',
        alreadyFriends: 'Этот пользователь уже в списке друзей.',
        userNotFound: 'Пользователь с таким email не найден.',
        // Friends Progress
        friendProgressTitle: 'Прогресс друзей',
        userNotFoundMsg: 'Пользователь не найден.',
        progressIsPrivate: 'Прогресс этого пользователя приватный.',
        noActiveCycles: 'У пользователя нет активных циклов.',
        noProgressData: 'Пока нет данных о прогрессе.',
        weekCompletion: 'Неделя {weekNumber}: {completion}% выполнения',
        noFriends: 'У вас еще нет друзей. Добавьте их в настройках.',
        geminiPrompt: 'Помоги мне составить сильное видение для моего 12-недельного года. Дай мне 3 вдохновляющих примера вопросов, которые я могу себе задать, чтобы сформулировать свое видение. Вопросы должны быть сосредоточены на личной трансформации и четких целях. Ответь на русском языке.',
        pdfError: 'Не удалось экспортировать в PDF.',
        visionError: 'Не удалось сгенерировать помощь. Пожалуйста, попробуйте позже.',
        // Chat
        chatWithFriendsTitle: 'Чат с друзьями',
        typeMessage: 'Напишите сообщение...',
        send: 'Отправить'
    },
    tr: {
        // General
        brandTitle: '- 12weekyear -',
        members: 'üye',
        back: 'Geri',
        next: 'İleri',
        save: 'Kaydet',
        cancel: 'İptal',
        close: 'Kapat',
        week: 'Hafta',
        day: 'Gün',
        you: 'Sen',
        // Auth
        login: 'Giriş Yap',
        registration: 'Kayıt Ol',
        email: 'E-posta',
        password: 'Şifre',
        loginButton: 'Giriş Yap',
        createAccount: 'Hesap Oluştur',
        noAccount: 'Hesabın yok mu?',
        register: 'Kayıt Ol',
        haveAccount: 'Zaten bir hesabın var mı?',
        fillAllFields: 'Lütfen tüm alanları doldurun.',
        invalidCredentials: 'Geçersiz e-posta veya şifre.',
        userExists: 'Bu e-posta ile bir kullanıcı zaten mevcut.',
        // Header
        logout: 'Çıkış Yap',
        toggleTheme: 'Temayı değiştir',
        settings: 'Ayarlar',
        // Home Screen
        myCycles: '12 Haftalık Döngülerim',
        cycleFrom: 'Döngü başlangıcı',
        until: 'Bitiş',
        goalsCount: 'hedef',
        noCycles: 'Henüz hiç döngünüz yok. İlk 12 haftalık yılınıza başlayın!',
        startYear: '12 Haftalık Yıla Başla',
        friendsProgress: 'Arkadaşların İlerlemesi',
        friendsChat: 'Arkadaşlarla Sohbet',
        // Onboarding
        aiThinking: 'Yapay zeka asistanı düşünüyor...',
        step1Title: 'Adım 1: Başlangıç Tarihi',
        step1Desc: '12 haftalık döngünüz için başlangıç tarihini seçin. Varsayılan olarak bugündür.',
        step2Title: 'Adım 2: 12 Haftalık Vizyonunuz',
        step2Desc: '12 hafta içinde kim olmak istiyorsunuz? Açık ve motive edici bir vizyon oluşturun.',
        visionPlaceholder: 'Örn: "12 hafta içinde enerji dolu ve harika bir formda olacağım..."',
        aiHelp: '✨ YZ Asistan Yardımı',
        step3Title: 'Adım 3: Ana Hedefleri Belirleyin',
        step3Desc: 'Bu döngü için 1-5 ana hedef belirleyin. Azı karar, çoğu zarar!',
        newGoalPlaceholder: 'Yeni ana hedef',
        habitsFor: 'Şunun için Alışkanlıklar',
        dailyActionsPrompt: 'Hangi günlük eylemler sizi bu hedefe ulaştıracak?',
        newHabitPlaceholder: 'Yeni günlük alışkanlık',
        startCycle: 'Döngüyü Başlat!',
        nextGoal: 'Sonraki Hedef',
        // Dashboard
        allCycles: 'Tüm Döngüler',
        yourVision: 'Vizyonunuz',
        editGoal: 'Hedefi Düzenle',
        editGoalAria: 'Hedefi düzenle',
        habit: 'Alışkanlık',
        noHabitsForGoal: 'Bu hedef için günlük alışkanlık belirlenmemiş.',
        weeklyReview: 'Haftalık Değerlendirme',
        noHabitsToRate: 'Değerlendirilecek alışkanlık yok.',
        yourScore: 'Puanınız:',
        execution: 'Uygulama:',
        rateHabitAria: 'Alışkanlığı puanla',
        notesPlaceholder: 'Neler iyi gitti? Neler geliştirilebilir?',
        exportPDF: 'PDF olarak dışa aktar',
        completeWeek: 'Haftayı Tamamla',
        exportingPDF: 'PDF\'e aktarılıyor...',
        // Modals
        editGoalTitle: 'Hedefi Düzenle',
        goalName: 'Hedef Adı',
        addHabit: 'Yeni alışkanlık ekle',
        overallProgress: 'Genel İlerleme',
        cycleSummary: 'Döngü Özeti',
        detailedGrid: 'Ayrıntılı Tablo',
        noHabitsToTrack: 'Takip edilecek alışkanlık yok.',
        // Settings
        privacySettings: 'Gizlilik Ayarları',
        whoCanSeeProgress: 'İlerlemenizi kimler görebilir?',
        allFriends: 'Tüm arkadaşlar',
        selectedFriends: 'Seçili arkadaşlar',
        none: 'Hiç kimse',
        addFriendsFirst: 'Önce arkadaş ekleyin.',
        manageFriends: 'Arkadaşları Yönet',
        addFriendByEmail: 'E-posta ile arkadaş ekle',
        cannotAddSelf: 'Kendinizi arkadaş olarak ekleyemezsiniz.',
        alreadyFriends: 'Bu kullanıcı zaten arkadaş listenizde.',
        userNotFound: 'Bu e-postaya sahip kullanıcı bulunamadı.',
        // Friends Progress
        friendProgressTitle: 'Arkadaşların İlerlemesi',
        userNotFoundMsg: 'Kullanıcı bulunamadı.',
        progressIsPrivate: 'Bu kullanıcının ilerlemesi gizli.',
        noActiveCycles: 'Kullanıcının aktif döngüsü yok.',
        noProgressData: 'Henüz ilerleme verisi yok.',
        weekCompletion: 'Hafta {weekNumber}: %{completion} tamamlama',
        noFriends: 'Henüz hiç arkadaşınız yok. Ayarlardan ekleyebilirsiniz.',
        geminiPrompt: '12 haftalık yılım için güçlü bir vizyon oluşturmama yardım et. Vizyonumu formüle etmek için kendime sorabileceğim 3 ilham verici örnek soru ver. Sorular kişisel dönüşüme ve net hedeflere odaklanmalı. Türkçe yanıt ver.',
        pdfError: 'PDF\'e aktarılamadı.',
        visionError: 'Yardım oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
        // Chat
        chatWithFriendsTitle: 'Arkadaşlarla Sohbet',
        typeMessage: 'Bir mesaj yazın...',
        send: 'Gönder'
    },
};

type Language = keyof typeof translations;
const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ru: 'ru-RU',
    tr: 'tr-TR'
};

const LanguageContext = createContext<{
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.en, replacements?: {[key: string]: string | number}) => string;
}>({
    language: 'ru',
    setLanguage: () => {},
    t: () => ''
});

const useLanguage = () => useContext(LanguageContext);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useLocalStorage<Language>('language', 'ru');

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = useCallback((key: keyof typeof translations.en, replacements?: {[key: string]: string | number}) => {
        let translation = translations[language][key] || translations.en[key] || key;
         if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
            });
        }
        return translation;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};


// --- TYPES ---
type Habit = {
    id: string;
    text: string;
};

type Goal = {
    id: string;
    text: string;
    habits: Habit[];
};

type Cycle = {
    id: string;
    startDate: string;
    endDate: string;
    vision: string;
    goals: Goal[];
};

type HabitStatus = {
    [cycleId: string]: {
        [date: string]: {
            [habitId: string]: boolean;
        };
    }
};

type UserScores = {
    [cycleId: string]: {
        [weekStartDate: string]: {
            [habitId: string]: number;
        }
    }
};

type CycleStats = {
    [cycleId: string]: {
        [weekStartDate: string]: {
            completion: number;
        };
    }
};

type WeeklyNotes = {
    [cycleId: string]: {
        [weekStartDate: string]: string;
    }
};

type PrivacySetting = 'all' | 'selected' | 'none';

type Privacy = {
    setting: PrivacySetting;
    allowedFriends: string[];
};

type User = {
    email: string;
    passwordHash: string;
    friends: string[];
    privacy: Privacy;
};

type Message = {
    id: string;
    sender: string; // email
    text: string;
    timestamp: number;
};

// Chat ID will be a sorted-joined list of participant emails
type AllChats = {
    [chatId: string]: Message[];
};


// --- API SETUP ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- HOOKS ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// --- DATE HELPERS ---
const getWeekDays = (date: Date): Date[] => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const weekStart = new Date(d.setDate(diff));

    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        weekDates.push(day);
    }
    return weekDates;
};

const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// --- COMPONENTS ---

const AppBrandHeader: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    const { t } = useLanguage();
    const memberCount = currentUser ? currentUser.friends.length + 1 : 1;
    
    return (
        <div className="app-brand-header">
            <div className="brand-logo">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="50" fill="var(--brand-logo-bg)"/>
                    <path d="M34.7997 52.8C35.5997 53.6 37.9997 56.4 39.5997 58.4C41.1997 60.4 42.7997 62.4 44.7997 64C46.7997 65.6 48.7997 66.8 50.7997 66.8C52.7997 66.8 54.9997 65.2 56.7997 62.8C58.5997 60.4 62.7997 53.2 64.7997 50C66.7997 46.8 68.3997 44.4 69.1997 43.2C69.9997 42 70.3997 41.2 70.3997 40.8C70.3997 40.4 70.1997 40 69.5997 39.6C68.9997 39.2 68.1997 39.2 67.5997 39.6C66.9997 40 65.9997 40.8 64.7997 42.4C63.5997 44 60.7997 48 58.3997 51.6C55.9997 55.2 53.9997 58.2 53.1997 59.6C52.3997 61 51.7997 62 51.3997 62.4C50.9997 62.8 50.7997 62.8 50.7997 62.8C50.7997 62.8 50.5997 62.8 50.1997 62.4C49.7997 62 49.1997 61.2 48.3997 60C47.5997 58.8 45.3997 55.6 43.1997 52.4C40.9997 49.2 38.9997 46.2 37.9997 44.4C36.9997 42.6 36.1997 41.4 35.7997 40.8C35.3997 40.2 34.9997 40 34.7997 40C34.5997 40 33.9997 40.2 33.3997 40.8C32.7997 41.4 32.3997 42.4 32.3997 43.6C32.3997 44.8 33.1997 46.6 34.7997 49.2C35.1997 49.8667 34.9997 52.4 34.7997 52.8Z" fill="var(--brand-pink)"/>
                </svg>
            </div>
            <h2>{t('brandTitle')}</h2>
            <p>{`${memberCount} ${t('members')}`}</p>
        </div>
    );
};

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const languages: Language[] = ['ru', 'en', 'de', 'tr'];

    return (
        <div className="language-switcher">
            {languages.map(lang => (
                <button
                    key={lang}
                    className={language === lang ? 'active' : ''}
                    onClick={() => setLanguage(lang)}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>
    );
};


const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="loading-overlay">
        <div style={{ textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    </div>
);


const Onboarding: React.FC<{ onComplete: (cycleData: Omit<Cycle, 'id'>) => void, onBack: () => void }> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [vision, setVision] = useState('');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const { t } = useLanguage();
    
    const totalSteps = goals.length > 0 ? 4 + goals.length -1 : 4;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleStartCycle = () => {
        const cycleStartDate = new Date(startDate);
        cycleStartDate.setHours(0,0,0,0);
        const endDate = addDays(cycleStartDate, 12 * 7 -1);

        const newCycleData: Omit<Cycle, 'id'> = {
            startDate: cycleStartDate.toISOString(),
            endDate: endDate.toISOString(),
            vision,
            goals
        };
        onComplete(newCycleData);
    };
    
    const generateVisionHelp = async () => {
        setIsLoading(true);
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: t('geminiPrompt'),
            });
            setVision(prev => `${prev}\n\n${response.text}`);
        } catch (error) {
            console.error("Error generating vision help:", error);
            alert(t('visionError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="onboarding-steps">
             {isLoading && <LoadingOverlay message={t('aiThinking')} />}
            <div className="progress-bar">
                <div className="progress-bar-inner" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
            
            <div style={{alignSelf: 'flex-start'}}>
                <button onClick={onBack} className="button button-secondary" style={{width: 'auto', padding: '0.5rem 1rem'}}>
                    &larr; {t('back')}
                </button>
            </div>

            {step === 1 && (
                 <div className="card">
                    <div className="card-content">
                        <h2>{t('step1Title')}</h2>
                        <p>{t('step1Desc')}</p>
                        <input 
                            type="date"
                            className="input"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                         <div className="button-group">
                            <button className="button" onClick={nextStep} disabled={!startDate}>{t('next')}</button>
                        </div>
                    </div>
                </div>
            )}


            {step === 2 && (
                <div className="card">
                    <div className="card-content">
                        <h2>{t('step2Title')}</h2>
                        <p>{t('step2Desc')}</p>
                        <textarea
                            className="textarea"
                            placeholder={t('visionPlaceholder')}
                            value={vision}
                            onChange={e => setVision(e.target.value)}
                        />
                         <div className="button-group" style={{flexDirection: 'column'}}>
                            <button className="button" onClick={nextStep} disabled={!vision.trim()}>{t('next')}</button>
                            <button className="button button-secondary" onClick={generateVisionHelp} disabled={isLoading}>
                                {t('aiHelp')}
                            </button>
                        </div>
                         <div className="button-group" style={{marginTop: '1rem'}}>
                             <button className="button button-secondary" onClick={prevStep}>{t('back')}</button>
                        </div>
                    </div>
                </div>
            )}
            {step === 3 && <EditableList
                title={t('step3Title')}
                description={t('step3Desc')}
                items={goals}
                setItems={setGoals}
                placeholder={t('newGoalPlaceholder')}
                maxItems={5}
                onNext={nextStep}
                onBack={prevStep}
            />}
            {step >= 4 && step < totalSteps + 1 && (
                <EditableHabitsForGoal
                    goal={goals[step - 4]}
                    setGoals={setGoals}
                    onNext={step < totalSteps ? nextStep : handleStartCycle}
                    onBack={prevStep}
                    isLastGoal={step - 4 === goals.length - 1}
                />
            )}
        </div>
    );
};

interface EditableListProps {
    title: string;
    description: string;
    items: {id: string, text: string}[];
    setItems: React.Dispatch<React.SetStateAction<any[]>>;
    placeholder: string;
    maxItems?: number;
    onNext: () => void;
    onBack: () => void;
}

const EditableList: React.FC<EditableListProps> = ({ title, description, items, setItems, placeholder, maxItems, onNext, onBack }) => {
    const [newItemText, setNewItemText] = useState('');
    const { t } = useLanguage();

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim() && (!maxItems || items.length < maxItems)) {
            setItems(prev => [...prev, { id: Date.now().toString(), text: newItemText.trim(), habits: [] }]);
            setNewItemText('');
        }
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="card">
            <div className="card-content">
                <h2>{title}</h2>
                <p>{description}</p>
                {(!maxItems || items.length < maxItems) && (
                    <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="input"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                            placeholder={placeholder}
                        />
                        <button type="submit" className="button" style={{width: 'auto', padding: '0 1.25rem'}}>+</button>
                    </form>
                )}
            </div>
            <div>
                {items.map(item => (
                    <div key={item.id} className="list-item">
                        <span>{item.text}</span>
                        <button onClick={() => removeItem(item.id)} className="delete-button" aria-label={`Удалить ${item.text}`}>&times;</button>
                    </div>
                ))}
            </div>
            <div className="card-content">
                 <div className="button-group">
                    <button className="button button-secondary" onClick={onBack}>{t('back')}</button>
                    <button className="button" onClick={onNext} disabled={items.length === 0}>{t('next')}</button>
                </div>
            </div>
        </div>
    );
};

const EditableHabitsForGoal: React.FC<{ goal: Goal, setGoals: React.Dispatch<React.SetStateAction<Goal[]>>, onNext: () => void, onBack: () => void, isLastGoal: boolean }> = ({ goal, setGoals, onNext, onBack, isLastGoal }) => {
    const [newHabitText, setNewHabitText] = useState('');
    const { t } = useLanguage();

    const addHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitText.trim()) {
            const newHabit: Habit = { id: Date.now().toString(), text: newHabitText.trim() };
            setGoals(prevGoals => prevGoals.map(g => g.id === goal.id ? { ...g, habits: [...g.habits, newHabit] } : g));
            setNewHabitText('');
        }
    };
    
    const removeHabit = (habitId: string) => {
        setGoals(prevGoals => prevGoals.map(g => g.id === goal.id ? { ...g, habits: g.habits.filter(h => h.id !== habitId) } : g));
    };

    return (
         <div className="card">
            <div className="card-content">
                <h2>{t('habitsFor')} "{goal.text}"</h2>
                <p>{t('dailyActionsPrompt')}</p>
                <form onSubmit={addHabit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        className="input"
                        value={newHabitText}
                        onChange={e => setNewHabitText(e.target.value)}
                        placeholder={t('newHabitPlaceholder')}
                    />
                    <button type="submit" className="button" style={{width: 'auto', padding: '0 1.25rem'}}>+</button>
                </form>
            </div>
            <div>
                {goal.habits.map(habit => (
                    <div key={habit.id} className="list-item">
                        <span>{habit.text}</span>
                        <button onClick={() => removeHabit(habit.id)} className="delete-button" aria-label={`Удалить ${habit.text}`}>&times;</button>
                    </div>
                ))}
            </div>
            <div className="card-content">
                <div className="button-group">
                    <button className="button button-secondary" onClick={onBack}>{t('back')}</button>
                    <button className="button" onClick={onNext}>
                        {isLastGoal ? t('startCycle') : t('nextGoal')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditGoalModal: React.FC<{
    goal: Goal;
    onSave: (updatedGoal: Goal) => void;
    onClose: () => void;
}> = ({ goal, onSave, onClose }) => {
    const [goalText, setGoalText] = useState(goal.text);
    const [habits, setHabits] = useState<Habit[]>(goal.habits);
    const [newHabitText, setNewHabitText] = useState('');
    const { t } = useLanguage();

    const handleHabitTextChange = (id: string, text: string) => {
        setHabits(habits.map(h => h.id === id ? { ...h, text } : h));
    };

    const removeHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const addHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitText.trim()) {
            const newHabit: Habit = { id: Date.now().toString(), text: newHabitText.trim() };
            setHabits([...habits, newHabit]);
            setNewHabitText('');
        }
    };

    const handleSave = () => {
        onSave({ ...goal, text: goalText, habits });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('editGoalTitle')}</h2>
                    <button onClick={onClose} className="close-button" aria-label={t('close')}>&times;</button>
                </div>
                <div className="modal-body">
                    <label htmlFor="goal-text-input" className="input-label">{t('goalName')}</label>
                    <input
                        id="goal-text-input"
                        type="text"
                        className="input"
                        value={goalText}
                        onChange={e => setGoalText(e.target.value)}
                    />
                    
                    <h4 className="modal-subheader">{t('habit')}ы</h4>
                    <div className="modal-habit-list">
                        {habits.map(habit => (
                            <div key={habit.id} className="list-item">
                                <input 
                                    type="text" 
                                    className="input list-item-input"
                                    value={habit.text}
                                    onChange={(e) => handleHabitTextChange(habit.id, e.target.value)}
                                    aria-label={`Редактировать привычку ${habit.text}`}
                                />
                                <button onClick={() => removeHabit(habit.id)} className="delete-button" aria-label={`Удалить привычку ${habit.text}`}>&times;</button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={addHabit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <input
                            type="text"
                            className="input"
                            value={newHabitText}
                            onChange={e => setNewHabitText(e.target.value)}
                            placeholder={t('addHabit')}
                        />
                        <button type="submit" className="button" style={{width: 'auto', padding: '0 1.25rem'}}>+</button>
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="button button-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button className="button" onClick={handleSave}>{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

const ViewSwitcher: React.FC<{ view: 'daily' | 'weekly', setView: (view: 'daily' | 'weekly') => void }> = ({ view, setView }) => {
    const { t } = useLanguage();
    return (
    <div className="view-switcher">
        <button className={view === 'daily' ? 'active' : ''} onClick={() => setView('daily')}>{t('day')}</button>
        <button className={view === 'weekly' ? 'active' : ''} onClick={() => setView('weekly')}>{t('week')}</button>
    </div>
    );
};

const OverallProgressModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cycle: Cycle;
    habitStatus: HabitStatus[string];
    cycleStats: CycleStats[string];
}> = ({ isOpen, onClose, cycle, habitStatus, cycleStats }) => {
    const { t } = useLanguage();

    const progressData = useMemo(() => {
        if (!isOpen) return { days: [], allHabits: [], weeklyData: [] };

        const allHabits = cycle.goals.flatMap(g => g.habits);
        const startDate = new Date(cycle.startDate);
        
        const days = Array.from({ length: 12 * 7 }, (_, i) => {
            const date = addDays(startDate, i);
            return {
                dayIndex: i + 1,
                dateString: date.toISOString().split('T')[0]
            };
        });

        const weeklyData = Array.from({ length: 12 }, (_, i) => {
            const weekStartDate = addDays(startDate, i * 7);
            const weekStartDateString = getWeekDays(weekStartDate)[0].toISOString().split('T')[0];
            return {
                week: i + 1,
                completion: cycleStats[weekStartDateString]?.completion || 0
            };
        });


        return { days, allHabits, weeklyData };

    }, [isOpen, cycle, cycleStats]);

    if (!isOpen) return null;

    const { days, allHabits, weeklyData } = progressData;
    const isHabitCompleted = (dateString: string, habitId: string) => habitStatus[dateString]?.[habitId] || false;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('overallProgress')}</h2>
                    <button onClick={onClose} className="close-button" aria-label={t('close')}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="progress-chart-container">
                         <h4>{t('cycleSummary')}</h4>
                         <div className="bar-chart">
                            {weeklyData.map(week => (
                                <div key={week.week} className="bar-item">
                                    <div className="bar-wrapper">
                                        <div className="bar" style={{ height: `${week.completion}%` }}>
                                            {week.completion > 15 && <span className="bar-label">{`${week.completion}%`}</span>}
                                        </div>
                                    </div>
                                    <span className="bar-axis-label">{week.week}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="progress-grid-container">
                        <h4>{t('detailedGrid')}</h4>
                        {allHabits.length > 0 ? (
                            <table className="progress-grid-table">
                                <thead>
                                    <tr>
                                        <th className="sticky-header">{t('habit')}</th>
                                        {days.map(day => <th key={day.dayIndex}>{day.dayIndex}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allHabits.map(habit => (
                                        <tr key={habit.id}>
                                            <td className="sticky-cell">{habit.text}</td>
                                            {days.map(day => (
                                                <td key={day.dateString}>
                                                    <div className={`grid-cell ${isHabitCompleted(day.dateString, habit.id) ? 'completed' : ''}`}></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>{t('noHabitsToTrack')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<{ 
    cycle: Cycle, 
    onGoBack: () => void,
    onCycleUpdate: (cycle: Cycle) => void,
    habitStatus: HabitStatus[string],
    setHabitStatus: React.Dispatch<React.SetStateAction<HabitStatus[string]>>,
    weeklyNotes: WeeklyNotes[string],
    setWeeklyNotes: React.Dispatch<React.SetStateAction<WeeklyNotes[string]>>,
    userScores: UserScores[string],
    setUserScores: React.Dispatch<React.SetStateAction<UserScores[string]>>,
    cycleStats: CycleStats[string],
    setCycleStats: React.Dispatch<React.SetStateAction<CycleStats[string]>>,
}> = ({ 
    cycle, onGoBack, onCycleUpdate, 
    habitStatus, setHabitStatus,
    weeklyNotes, setWeeklyNotes,
    userScores, setUserScores,
    cycleStats, setCycleStats
}) => {
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { t, language } = useLanguage();

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);

    const weekDates = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const todayDateString = today.toISOString().split('T')[0];
    const weekStartDateString = weekDates[0].toISOString().split('T')[0];
    
    const cycleStartDate = useMemo(() => new Date(cycle.startDate), [cycle.startDate]);
    const cycleEndDate = useMemo(() => new Date(cycle.endDate), [cycle.endDate]);

    const toggleHabit = useCallback((dateString: string, habitId: string) => {
        setHabitStatus(prev => {
            const newStatusForDate = {...(prev[dateString] || {}), [habitId]: !prev[dateString]?.[habitId]};
            return {...prev, [dateString]: newStatusForDate};
        });
    }, [setHabitStatus]);

    const isHabitChecked = (dateString: string, habitId: string) => {
        return habitStatus[dateString]?.[habitId] || false;
    };
    
    const elapsedDays = (currentDate.getTime() - cycleStartDate.getTime()) / (1000 * 3600 * 24);
    const currentWeek = Math.max(1, Math.min(12, Math.floor(elapsedDays / 7) + 1));
    const currentWeekDateRange = `${weekDates[0].toLocaleDateString(locales[language], {day: '2-digit', month: 'short'})} - ${weekDates[6].toLocaleDateString(locales[language], {day: '2-digit', month: 'short'})}`;

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setWeeklyNotes(prev => ({
            ...prev,
            [weekStartDateString]: e.target.value
        }));
    };
    
    const handleSaveGoal = (updatedGoal: Goal) => {
        const updatedGoals = cycle.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
        onCycleUpdate({ ...cycle, goals: updatedGoals });
        setEditingGoal(null);
    };

    const handleUserScoreChange = useCallback((habitId: string, score: number) => {
        setUserScores(prev => {
            const newScoresForWeek = {...(prev[weekStartDateString] || {}), [habitId]: score};
            return {...prev, [weekStartDateString]: newScoresForWeek};
        });
    }, [setUserScores, weekStartDateString]);
    
    const handlePrevWeek = () => {
        const prevWeekDate = addDays(currentDate, -7);
        if (prevWeekDate >= cycleStartDate) {
            setCurrentDate(prevWeekDate);
        }
    };
    const handleNextWeek = () => {
        const nextWeekDate = addDays(currentDate, 7);
        if (nextWeekDate <= cycleEndDate) {
            setCurrentDate(nextWeekDate);
        }
    };
    
    const handleCompleteWeek = () => {
        const allHabits = cycle.goals.flatMap(g => g.habits);
        if (allHabits.length === 0) {
            handleNextWeek();
            return;
        }

        let totalScore = 0;
        allHabits.forEach(habit => {
            let checkedCount = 0;
            let elapsedDaysInWeek = 0;
            weekDates.forEach(date => {
                if (!isFutureDate(date)) {
                    elapsedDaysInWeek++;
                    const dateString = date.toISOString().split('T')[0];
                    if (isHabitChecked(dateString, habit.id)) {
                        checkedCount++;
                    }
                }
            });
            const autoScore = elapsedDaysInWeek > 0 ? Math.round((checkedCount / elapsedDaysInWeek) * 100) : 0;
            totalScore += autoScore;
        });

        const overallCompletion = allHabits.length > 0 ? Math.round(totalScore / allHabits.length) : 0;

        setCycleStats(prev => ({
            ...prev,
            [weekStartDateString]: { completion: overallCompletion }
        }));
        
        handleNextWeek();
    };
    
    const handleExportPDF = async () => {
        const content = dashboardRef.current;
        if (!content) return;
        
        setIsExporting(true);
        try {
            const canvas = await html2canvas(content, { 
                scale: 2,
                backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1a192a' : '#F5F3F7'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const dateStr = new Date().toISOString().split('T')[0];
            pdf.save(`12_week_review_${dateStr}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert(t('pdfError'));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            {isExporting && <LoadingOverlay message={t('exportingPDF')} />}
            <div className="dashboard-header">
                <button onClick={onGoBack} className="button button-secondary" style={{width: 'auto', padding: '0.5rem 1rem', marginBottom: '1rem'}}>
                    &larr; {t('allCycles')}
                </button>
                <div className="dashboard-title-container">
                    <div className="week-navigation">
                         <button onClick={handlePrevWeek} disabled={getWeekDays(currentDate)[0] < cycleStartDate} className="nav-button" aria-label="Предыдущая неделя">⟨</button>
                         <div style={{textAlign: 'center'}}>
                            <h2>{t('week')} {currentWeek}</h2>
                            <p className="date-range">{currentWeekDateRange}</p>
                         </div>
                         <button onClick={handleNextWeek} disabled={getWeekDays(currentDate)[6] >= cycleEndDate} className="nav-button" aria-label="Следующая неделя">⟩</button>
                    </div>
                    <button onClick={() => setIsProgressModalOpen(true)} className="progress-button" aria-label={t('overallProgress')}>📊</button>
                </div>
            </div>

            <div ref={dashboardRef}>
                <details className="card" style={{border: 'none'}}>
                    <summary className="vision-summary">
                        {t('yourVision')}
                    </summary>
                    <div className="card-content" style={{paddingTop: '0.5rem'}}>
                        <p style={{marginTop: '0.5rem', marginBottom: 0}}>{cycle.vision}</p>
                    </div>
                </details>
                
                <ViewSwitcher view={viewMode} setView={setViewMode} />

                {viewMode === 'daily' && cycle.goals.map(goal => (
                    <div key={goal.id} className="card goal-card">
                        <div className="card-content goal-card-header">
                            <h3>{goal.text}</h3>
                            <button className="edit-goal-button" onClick={() => setEditingGoal(goal)} aria-label={`${t('editGoalAria')} ${goal.text}`}>
                                ✏️
                            </button>
                        </div>
                         {goal.habits.length > 0 ? (
                             goal.habits.map(habit => (
                                <label key={habit.id} className="list-item daily-habit-item">
                                    <span>{habit.text}</span>
                                    <div className="day-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isHabitChecked(todayDateString, habit.id)}
                                            onChange={() => toggleHabit(todayDateString, habit.id)}
                                            aria-label={`Отметить ${habit.text} на сегодня`}
                                        />
                                        <div className={`day-checkbox ${todayDateString === todayDateString ? 'today' : ''}`}></div>
                                    </div>
                                </label>
                             ))
                        ) : (
                            <div className="card-content" style={{padding: '0 1rem 1rem'}}>
                                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0}}>{t('noHabitsForGoal')}</p>
                            </div>
                        )}
                    </div>
                ))}

                {viewMode === 'weekly' && cycle.goals.map(goal => (
                    <div key={goal.id} className="card goal-card">
                        <div className="card-content goal-card-header">
                            <h3>{goal.text}</h3>
                            <button className="edit-goal-button" onClick={() => setEditingGoal(goal)} aria-label={`${t('editGoalAria')} ${goal.text}`}>
                               ✏️
                            </button>
                        </div>
                        <div className="habit-header">
                            <span className="habit-header-text">{t('habit')}</span>
                            <div className="habit-days-header">
                                {weekDates.map(date => <span key={date.toISOString()}>{date.toLocaleDateString(locales[language], { weekday: 'short' })}</span>)}
                            </div>
                        </div>
                         {goal.habits.length > 0 ? (
                             goal.habits.map(habit => (
                                <div key={habit.id} className="habit-item">
                                    <span className="habit-text">{habit.text}</span>
                                    <div className="habit-days">
                                         {weekDates.map(date => {
                                            const dateString = date.toISOString().split('T')[0];
                                            return (
                                                <label key={dateString} className="day-checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={isHabitChecked(dateString, habit.id)}
                                                        onChange={() => toggleHabit(dateString, habit.id)}
                                                        disabled={isFutureDate(date)}
                                                        aria-label={`Отметить ${habit.text} на ${date.toLocaleDateString('ru-RU')}`}
                                                    />
                                                    <div className={`day-checkbox ${dateString === todayDateString ? 'today' : ''}`}></div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                             ))
                        ) : (
                            <div className="card-content">
                                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '0.5rem 0'}}>{t('noHabitsForGoal')}</p>
                            </div>
                        )}
                    </div>
                ))}
                
                <div className="card weekly-review-card">
                    <div className="card-content">
                        <h3>{t('weeklyReview')}</h3>
                        {cycle.goals.flatMap(g => g.habits).length > 0 ? (
                             cycle.goals.flatMap(goal => goal.habits).map(habit => {
                                let checkedCount = 0;
                                let elapsedDaysInWeek = 0;
                                weekDates.forEach(date => {
                                    if (!isFutureDate(date)) {
                                        elapsedDaysInWeek++;
                                        const dateString = date.toISOString().split('T')[0];
                                        if (isHabitChecked(dateString, habit.id)) {
                                            checkedCount++;
                                        }
                                    }
                                });
                                const autoScore = elapsedDaysInWeek > 0 ? Math.round((checkedCount / elapsedDaysInWeek) * 100) : 0;
                                const userScore = userScores[weekStartDateString]?.[habit.id] ?? autoScore;

                                return (
                                    <div key={habit.id} className="habit-score-item">
                                        <span className="habit-score-text">{habit.text}</span>
                                        <div className="score-details">
                                            <span>{t('yourScore')} {userScore}%</span>
                                            <span style={{float: 'right'}}>{t('execution')} {autoScore}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={userScore}
                                            onChange={(e) => handleUserScoreChange(habit.id, parseInt(e.target.value))}
                                            aria-label={`${t('rateHabitAria')} ${habit.text}`}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{t('noHabitsToRate')}</p>
                        )}

                        <textarea 
                            className="textarea" 
                            placeholder={t('notesPlaceholder')}
                            value={weeklyNotes[weekStartDateString] || ''}
                            onChange={handleNoteChange}
                        />
                         <div className="button-group" style={{marginTop: '1rem'}}>
                            <button className="button button-secondary" onClick={handleExportPDF} disabled={isExporting}>
                                {t('exportPDF')}
                            </button>
                             <button className="button" onClick={handleCompleteWeek}>
                                {t('completeWeek')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {editingGoal && (
                <EditGoalModal
                    goal={editingGoal}
                    onSave={handleSaveGoal}
                    onClose={() => setEditingGoal(null)}
                />
            )}
             <OverallProgressModal 
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                cycle={cycle}
                habitStatus={habitStatus}
                cycleStats={cycleStats}
            />
        </div>
    );
};

const HomeScreen: React.FC<{
    currentUser: User;
    cycles: Cycle[],
    onSelectCycle: (cycleId: string) => void,
    onNewCycle: () => void,
    onViewFriends: () => void,
    onViewChat: () => void,
}> = ({ currentUser, cycles, onSelectCycle, onNewCycle, onViewFriends, onViewChat }) => {
    const { t, language } = useLanguage();
    return (
        <div className="home-screen">
             <h2>{t('myCycles')}</h2>
            {cycles.length > 0 ? (
                <div className="cycle-list">
                    {cycles.map(cycle => (
                        <div key={cycle.id} className="cycle-list-item card" onClick={() => onSelectCycle(cycle.id)}>
                            <div className="card-content">
                                <h3>{t('cycleFrom')} {new Date(cycle.startDate).toLocaleDateString(locales[language])}</h3>
                                <p>{t('until')} {new Date(cycle.endDate).toLocaleDateString(locales[language])}</p>
                                <span>{cycle.goals.length} {t('goalsCount')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="card-content" style={{textAlign: 'center'}}>
                        <p>{t('noCycles')}</p>
                    </div>
                </div>
            )}
             <div className="button-group" style={{ flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="button" onClick={onNewCycle}>{t('startYear')}</button>
                <button className="button button-secondary" onClick={onViewFriends}>{t('friendsProgress')}</button>
                <button className="button button-secondary" onClick={onViewChat} disabled={currentUser.friends.length === 0}>
                    {t('friendsChat')}
                </button>
             </div>
        </div>
    );
};

const SettingsScreen: React.FC<{
    currentUser: User;
    allUsers: { [email: string]: User };
    onSave: (updatedUser: User) => void;
    onClose: () => void;
}> = ({ currentUser, allUsers, onSave, onClose }) => {
    const [privacy, setPrivacy] = useState<Privacy>(currentUser.privacy);
    const [friends, setFriends] = useState<string[]>(currentUser.friends);
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const emailToAdd = newFriendEmail.trim().toLowerCase();
        if (!emailToAdd) return;
        if (emailToAdd === currentUser.email) {
            setError(t('cannotAddSelf'));
            return;
        }
        if (friends.includes(emailToAdd)) {
            setError(t('alreadyFriends'));
            return;
        }
        if (!allUsers[emailToAdd]) {
            setError(t('userNotFound'));
            return;
        }
        setFriends([...friends, emailToAdd]);
        setNewFriendEmail('');
    };

    const handleRemoveFriend = (emailToRemove: string) => {
        setFriends(friends.filter(f => f !== emailToRemove));
        setPrivacy(prev => ({
            ...prev,
            allowedFriends: prev.allowedFriends.filter(f => f !== emailToRemove)
        }));
    };

    const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSetting = e.target.value as PrivacySetting;
        setPrivacy(prev => ({ ...prev, setting: newSetting }));
    };

    const handleAllowedFriendToggle = (email: string) => {
        setPrivacy(prev => {
            const isAllowed = prev.allowedFriends.includes(email);
            const newAllowed = isAllowed
                ? prev.allowedFriends.filter(f => f !== email)
                : [...prev.allowedFriends, email];
            return { ...prev, allowedFriends: newAllowed };
        });
    };

    const handleSave = () => {
        onSave({ ...currentUser, friends, privacy });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('settings')}</h2>
                    <button onClick={onClose} className="close-button" aria-label={t('close')}>&times;</button>
                </div>
                <div className="modal-body">
                    {/* Language Switcher */}
                    <div className="settings-section">
                        <h4>Язык</h4>
                        <LanguageSwitcher />
                    </div>
                    {/* Privacy Settings */}
                    <div className="settings-section">
                        <h4>{t('privacySettings')}</h4>
                        <p className="settings-description">{t('whoCanSeeProgress')}</p>
                        <div className="privacy-options">
                            <label><input type="radio" name="privacy" value="all" checked={privacy.setting === 'all'} onChange={handlePrivacyChange}/> {t('allFriends')}</label>
                            <label><input type="radio" name="privacy" value="selected" checked={privacy.setting === 'selected'} onChange={handlePrivacyChange}/> {t('selectedFriends')}</label>
                            <label><input type="radio" name="privacy" value="none" checked={privacy.setting === 'none'} onChange={handlePrivacyChange}/> {t('none')}</label>
                        </div>
                        {privacy.setting === 'selected' && (
                            <div className="allowed-friends-list">
                                {friends.length > 0 ? friends.map(friend => (
                                    <label key={friend} className="list-item">
                                        <span>{friend}</span>
                                        <input type="checkbox" checked={privacy.allowedFriends.includes(friend)} onChange={() => handleAllowedFriendToggle(friend)} />
                                    </label>
                                )) : <p>{t('addFriendsFirst')}</p>}
                            </div>
                        )}
                    </div>
                    
                    {/* Friends Management */}
                    <div className="settings-section">
                        <h4>{t('manageFriends')}</h4>
                        <div className="modal-habit-list">
                            {friends.map(friend => (
                                <div key={friend} className="list-item">
                                    <span>{friend}</span>
                                    <button onClick={() => handleRemoveFriend(friend)} className="delete-button" aria-label={`Удалить ${friend}`}>&times;</button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <input
                                type="email"
                                className="input"
                                value={newFriendEmail}
                                onChange={e => setNewFriendEmail(e.target.value)}
                                placeholder={t('addFriendByEmail')}
                            />
                            <button type="submit" className="button" style={{width: 'auto', padding: '0 1.25rem'}}>+</button>
                        </form>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="button button-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button className="button" onClick={handleSave}>{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

const FriendsProgressScreen: React.FC<{
    currentUser: User;
    allUsers: { [email: string]: User };
    allCycles: { [email: string]: Cycle[] };
    allCycleStats: { [email: string]: CycleStats };
    onClose: () => void;
}> = ({ currentUser, allUsers, allCycles, allCycleStats, onClose }) => {
    const { t } = useLanguage();
    
    const getFriendProgress = (friendEmail: string) => {
        const friendUser = allUsers[friendEmail];
        if (!friendUser) return { canView: false, message: t('userNotFoundMsg') };

        const friendPrivacy = friendUser.privacy;
        const canView = 
            friendPrivacy.setting === 'all' || 
            (friendPrivacy.setting === 'selected' && friendPrivacy.allowedFriends.includes(currentUser.email));

        if (!canView) {
            return { canView: false, message: t('progressIsPrivate') };
        }

        const friendCycles = allCycles[friendEmail] || [];
        if (friendCycles.length === 0) {
            return { canView: true, message: t('noActiveCycles') };
        }
        
        const latestCycle = friendCycles.reduce((a, b) => new Date(a.startDate) > new Date(b.startDate) ? a : b);
        const friendStats = allCycleStats[friendEmail]?.[latestCycle.id] || {};
        const weekKeys = Object.keys(friendStats);

        if(weekKeys.length === 0) {
             return { canView: true, message: t('noProgressData') };
        }

        const lastWeekKey = weekKeys.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
        const lastWeekCompletion = friendStats[lastWeekKey].completion;
        
        const cycleStartDate = new Date(latestCycle.startDate);
        const lastWeekStartDate = new Date(lastWeekKey);
        const weekNumber = Math.floor((lastWeekStartDate.getTime() - cycleStartDate.getTime()) / (1000 * 3600 * 24 * 7)) + 1;

        return {
            canView: true,
            message: t('weekCompletion', { weekNumber, completion: lastWeekCompletion })
        };
    };

    return (
        <div>
            <div className="dashboard-header" style={{paddingBottom: 0, marginBottom: '1rem'}}>
                <button onClick={onClose} className="button button-secondary" style={{width: 'auto', padding: '0.5rem 1rem', marginBottom: '1rem'}}>
                    &larr; {t('back')}
                </button>
                <h2>{t('friendProgressTitle')}</h2>
            </div>
            <div className="friends-progress-list">
                {currentUser.friends.length > 0 ? currentUser.friends.map(friendEmail => {
                    const { canView, message } = getFriendProgress(friendEmail);
                    return (
                        <div key={friendEmail} className="card">
                            <div className="card-content">
                                <h3>{friendEmail}</h3>
                                <p className={!canView ? 'text-secondary' : ''}>{message}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="card">
                        <div className="card-content" style={{textAlign: 'center'}}>
                            <p>{t('noFriends')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatScreen: React.FC<{
    currentUser: User;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onClose: () => void;
}> = ({ currentUser, messages, onSendMessage, onClose }) => {
    const { t } = useLanguage();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="chat-screen-container">
             <div className="dashboard-header" style={{paddingBottom: 0, marginBottom: '1rem'}}>
                <button onClick={onClose} className="button button-secondary" style={{width: 'auto', padding: '0.5rem 1rem'}}>
                    &larr; {t('back')}
                </button>
                <h2>{t('chatWithFriendsTitle')}</h2>
            </div>
            <div className="messages-list">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === currentUser.email ? 'sent' : 'received'}`}>
                        <div className="message-sender">{msg.sender === currentUser.email ? t('you') : msg.sender.split('@')[0]}</div>
                        <div className="message-text">{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    className="input"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={t('typeMessage')}
                />
                <button type="submit" className="button" style={{width: 'auto', padding: '0 1.5rem'}}>{t('send')}</button>
            </form>
        </div>
    );
};

const Auth: React.FC<{ onAuth: (user: User) => void, users: { [email: string]: User }, setUsers: React.Dispatch<React.SetStateAction<{ [email: string]: User }>> }> = ({ onAuth, users, setUsers }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const hashPassword = (pass: string) => {
        // This is a simple, insecure hash for demonstration.
        // In a real app, use a library like bcrypt.
        return `hashed_${pass}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const emailKey = email.toLowerCase();
        if (!email || !password) {
            setError(t('fillAllFields'));
            return;
        }

        if (isLogin) {
            const user = users[emailKey];
            if (user && user.passwordHash === hashPassword(password)) {
                onAuth(user);
            } else {
                setError(t('invalidCredentials'));
            }
        } else { // Registration
            if (users[emailKey]) {
                setError(t('userExists'));
                return;
            }
            const newUser: User = {
                email: emailKey,
                passwordHash: hashPassword(password),
                friends: [],
                privacy: { setting: 'all', allowedFriends: [] }
            };
            const newUsers = { ...users, [emailKey]: newUser };
            setUsers(newUsers);
            onAuth(newUser);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="card-content">
                    <div style={{marginBottom: '1.5rem'}}>
                        <LanguageSwitcher />
                    </div>
                    <h2>{isLogin ? t('login') : t('registration')}</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="input"
                            placeholder={t('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="input"
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="button">
                            {isLogin ? t('loginButton') : t('createAccount')}
                        </button>
                    </form>
                    {error && <p className="error-message">{error}</p>}
                    <p className="auth-switcher">
                        {isLogin ? t('noAccount') : t('haveAccount')}{' '}
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? t('register') : t('login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const MainContent: React.FC<{
    currentUser: User,
    users: {[email:string]: User},
    updateUser: (user: User) => void,
    allChats: AllChats,
    setAllChats: React.Dispatch<React.SetStateAction<AllChats>>,
}> = ({ currentUser, users, updateUser, allChats, setAllChats }) => {
    const [allCycles, setAllCycles] = useLocalStorage<{ [email: string]: Cycle[] }>('allCycles', {});
    const [habitStatus, setHabitStatus] = useLocalStorage<HabitStatus>('habitStatus', {});
    const [weeklyNotes, setWeeklyNotes] = useLocalStorage<WeeklyNotes>('weeklyNotes', {});
    const [userScores, setUserScores] = useLocalStorage<UserScores>('userScores', {});
    const [cycleStats, setCycleStats] = useLocalStorage<{ [email: string]: CycleStats }>('cycleStats', {});
    const [currentView, setCurrentView] = useState<'home' | 'onboarding' | 'dashboard' | 'settings' | 'friends' | 'chat'>('home');
    const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
    const { t } = useLanguage();

    const userCycles = allCycles[currentUser.email] || [];
    const activeCycle = userCycles.find(c => c.id === activeCycleId);

    const chatId = useMemo(() => {
        if (!currentUser) return '';
        return [currentUser.email, ...currentUser.friends].sort().join('|');
    }, [currentUser]);

    const handleNewCycle = () => setCurrentView('onboarding');
    const handleSelectCycle = (cycleId: string) => {
        setActiveCycleId(cycleId);
        setCurrentView('dashboard');
    };
    const handleGoHome = () => {
        setActiveCycleId(null);
        setCurrentView('home');
    };

    const handleOnboardingComplete = (cycleData: Omit<Cycle, 'id'>) => {
        const newCycle: Cycle = { ...cycleData, id: Date.now().toString() };
        const updatedUserCycles = [...userCycles, newCycle];
        setAllCycles(prev => ({ ...prev, [currentUser.email]: updatedUserCycles }));
        setActiveCycleId(newCycle.id);
        setCurrentView('dashboard');
    };
    
    const handleCycleUpdate = (updatedCycle: Cycle) => {
        const updatedUserCycles = userCycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
        setAllCycles(prev => ({ ...prev, [currentUser.email]: updatedUserCycles }));
    };

    const handleSaveSettings = (updatedUser: User) => {
        updateUser(updatedUser);
    };

    const handleSendMessage = (text: string) => {
        if (!chatId) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            sender: currentUser.email,
            text,
            timestamp: Date.now()
        };
        setAllChats(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), newMessage]
        }));
    };

    const renderContent = () => {
        switch (currentView) {
            case 'onboarding':
                return <Onboarding onComplete={handleOnboardingComplete} onBack={handleGoHome} />;
            case 'dashboard':
                if (activeCycle) {
                    const cycleId = activeCycle.id;
                    return <Dashboard 
                        cycle={activeCycle}
                        onGoBack={handleGoHome}
                        onCycleUpdate={handleCycleUpdate}
                        habitStatus={habitStatus[cycleId] || {}}
                        setHabitStatus={(updater) => setHabitStatus(p => ({...p, [cycleId]: updater instanceof Function ? updater(p[cycleId] || {}) : updater}))}
                        weeklyNotes={weeklyNotes[cycleId] || {}}
                        setWeeklyNotes={(updater) => setWeeklyNotes(p => ({...p, [cycleId]: updater instanceof Function ? updater(p[cycleId] || {}) : updater}))}
                        userScores={userScores[cycleId] || {}}
                        setUserScores={(updater) => setUserScores(p => ({...p, [cycleId]: updater instanceof Function ? updater(p[cycleId] || {}) : updater}))}
                        cycleStats={cycleStats[currentUser.email]?.[cycleId] || {}}
                        setCycleStats={(updater) => setCycleStats(p => {
                            const email = currentUser.email;
                            const userStats = p[email] || {};
                            const cycleData = userStats[cycleId] || {};
                            const newCycleData = updater instanceof Function ? updater(cycleData) : updater;
                            const newUserStats = { ...userStats, [cycleId]: newCycleData };
                            return { ...p, [email]: newUserStats };
                        })}
                    />;
                }
                return null; // Should not happen
             case 'settings':
                return <SettingsScreen
                    currentUser={currentUser}
                    allUsers={users}
                    onSave={handleSaveSettings}
                    onClose={() => setCurrentView('home')}
                />
            case 'friends':
                return <FriendsProgressScreen
                    currentUser={currentUser}
                    allUsers={users}
                    allCycles={allCycles}
                    allCycleStats={cycleStats}
                    onClose={() => setCurrentView('home')}
                />
            case 'chat':
                return <ChatScreen
                    currentUser={currentUser}
                    messages={allChats[chatId] || []}
                    onSendMessage={handleSendMessage}
                    onClose={handleGoHome}
                />;
            case 'home':
            default:
                return <HomeScreen 
                    currentUser={currentUser}
                    cycles={userCycles} 
                    onSelectCycle={handleSelectCycle} 
                    onNewCycle={handleNewCycle} 
                    onViewFriends={() => setCurrentView('friends')} 
                    onViewChat={() => setCurrentView('chat')}
                />;
        }
    };
    
    // Full-screen views that replace the home screen content
    if(currentView === 'settings' || currentView === 'friends' || currentView === 'chat') {
         return renderContent();
    }

    return (
        <>
            <div className="button-group" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                <button onClick={() => setCurrentView('settings')} className="settings-button" aria-label={t('settings')}>⚙️</button>
            </div>
            {renderContent()}
        </>
    );
};


const App: React.FC = () => {
    const [users, setUsers] = useLocalStorage<{ [email: string]: User }>('users', {});
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
    const [allChats, setAllChats] = useLocalStorage<AllChats>('allChats', {});
    const { t } = useLanguage();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleAuth = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const updateUser = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        setUsers(prev => ({...prev, [updatedUser.email]: updatedUser}));
    };
    
    return (
        <div className="app-container">
            <header className="header">
                 <AppBrandHeader currentUser={currentUser} />
                <div className="header-controls">
                    {currentUser && <button onClick={handleLogout} className="logout-button" aria-label={t('logout')}>{t('logout')}</button>}
                    <button onClick={toggleTheme} className="theme-switcher" aria-label={t('toggleTheme')}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>
            <main>
                {currentUser ? (
                    <MainContent 
                        currentUser={currentUser} 
                        users={users} 
                        updateUser={updateUser} 
                        allChats={allChats}
                        setAllChats={setAllChats}
                    />
                ) : (
                    <Auth onAuth={handleAuth} users={users} setUsers={setUsers} />
                )}
            </main>
        </div>
    );
};

const RootApp = () => (
    <LanguageProvider>
        <App />
    </LanguageProvider>
);

const container = document.getElementById('root');
if(container) {
    const root = createRoot(container);
    root.render(<RootApp />);
}
