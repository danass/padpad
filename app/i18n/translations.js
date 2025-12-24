/**
 * Translations for TextPad
 * 
 * Languages: English, French, Spanish, Chinese, Russian
 * 
 * To add a new language:
 * 1. Add the language code to `locales` array
 * 2. Add translations object with the same keys as English
 */

export const locales = ['en', 'fr', 'es', 'zh', 'ru']

export const defaultLocale = 'en'

export const localeNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  zh: '中文',
  ru: 'Русский'
}

export const translations = {
  en: {
    // App
    appName: 'textpad',
    tagline: 'A simple, beautiful writing space',
    
    // Header
    newDocument: 'New Document',
    drive: 'Drive',
    settings: 'Settings',
    signIn: 'Sign in',
    signOut: 'Sign out',
    
    // Home page
    startWriting: 'Start writing...',
    saveDocument: 'Save Document',
    saving: 'Saving...',
    savedLocally: 'Your document is saved locally. Click "Save Document" to save it permanently.',
    clickToSave: 'Click "Save" to sign in and save your document permanently.',
    
    // Drive
    myDocuments: 'My Documents',
    createFolder: 'Create Folder',
    newFolder: 'New Folder',
    noDocuments: 'No documents yet',
    createFirst: 'Create a new document to get started',
    searchDocuments: 'Search documents...',
    
    // Document list
    name: 'Name',
    type: 'Type',
    date: 'Date',
    visibility: 'Visibility',
    folder: 'Folder',
    document: 'Document',
    untitled: 'Untitled',
    
    // Context menu
    open: 'Open',
    viewPublic: 'View public',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this',
    words: 'words',
    word: 'word',
    characters: 'characters',
    character: 'character',
    images: 'images',
    image: 'image',
    drawings: 'drawings',
    drawing: 'drawing',
    emptyDocument: 'Empty document',
    
    // Editor
    back: 'Back',
    backToDrive: 'Back to Drive',
    export: 'Export',
    history: 'History',
    copyUrl: 'Copy URL',
    urlCopied: 'URL copied',
    private: 'Private',
    public: 'Public',
    makePrivate: 'Make private',
    makePublic: 'Make public',
    nowPrivate: 'Now private',
    nowPublic: 'Now public',
    fullWidth: 'Full width',
    normalWidth: 'Normal width',
    preview: 'Preview',
    
    // Save status
    unsavedChanges: 'Unsaved changes',
    saved: 'Saved',
    
    // Toolbar
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    clearFormatting: 'Clear formatting',
    textColor: 'Text color',
    highlighter: 'Highlighter',
    presetColors: 'Preset Colors',
    customColor: 'Custom Color',
    bulletList: 'Bullet list',
    numberedList: 'Numbered list',
    insertImage: 'Insert image',
    drawingArea: 'Drawing area',
    insertLink: 'Insert link',
    undo: 'Undo',
    redo: 'Redo',
    prevFont: 'Previous font',
    nextFont: 'Next font',
    brushMode: 'Brush mode',
    alignment: 'Alignment',
    left: 'Left',
    center: 'Center',
    right: 'Right',
    justified: 'Justified',
    
    // Alignment
    alignLeft: 'Align left',
    alignCenter: 'Align center',
    alignRight: 'Align right',
    alignJustify: 'Justify',
    
    // Context menu (editor)
    convertTo: 'Convert to',
    blocks: 'Blocks',
    blocksHint: '(whole paragraph)',
    paragraph: 'Paragraph',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    heading4: 'Heading 4',
    codeAndQuote: 'Code & Quote',
    codeBlock: 'Code block',
    inlineCode: 'Inline code',
    quote: 'Quote',
    lists: 'Lists',
    taskList: 'Task list',
    formatting: 'Formatting',
    formattingHint: '(selection)',
    subscript: 'Subscript',
    superscript: 'Superscript',
    highlighted: 'Highlighted',
    other: 'Other',
    horizontalRule: 'Horizontal rule',
    link: 'Link',
    linkUrl: 'Link URL:',
    
    // History
    documentHistory: 'Document History',
    noHistory: 'No history available',
    restore: 'Restore',
    restoreVersion: 'Restore this version?',
    
    // Settings
    accountSettings: 'Account Settings',
    profilePicture: 'Profile Picture',
    changeAvatar: 'Change Avatar',
    useGoogleAvatar: 'Use Google Avatar',
    removeAvatar: 'Remove Avatar',
    
    // Digital Legacy
    digitalLegacy: 'Digital Legacy',
    digitalLegacySettings: 'Digital Legacy Settings',
    digitalLegacyDescription: 'Manage how your digital legacy will be preserved and shared.',
    digitalLegacyWarning: 'Your writings will automatically become publicly accessible on your 99th birthday, creating your digital legacy.',
    dateOfBirth: 'Date of Birth',
    birthday99: 'Your 99th birthday is on',
    noBirthDate: 'No birth date set — your documents will remain private forever.',
    customUrlUsername: 'Custom URL Username',
    usernameHint: 'Only lowercase letters, numbers, hyphens, and underscores.',
    previewLegacy: 'Preview Digital Legacy',
    previewLegacyDescription: 'See how your public digital legacy page will appear.',
    
    // Public view
    allArticles: 'All articles',
    previous: 'Previous',
    next: 'Next',
    noTitle: 'Untitled',
    publicDocuments: 'public documents',
    publicDocument: 'public document',
    noPublicDocuments: 'No public documents',
    userNoPublicDocs: 'This user has no public documents yet.',
    
    // Footer
    credits: 'Credits',
    madeBy: 'Made with care by',
    brotherApp: 'Brother app of',
    
    // Errors
    error: 'Error',
    documentNotFound: 'Document not found',
    documentNotFoundDesc: 'The document you are looking for does not exist or has been deleted.',
    accessDenied: 'Access Denied',
    documentPrivate: 'This document is private and cannot be accessed publicly.',
    goHome: 'Go to Home',
    failedToLoad: 'Failed to load',
    failedToUpdate: 'Failed to update',
    
    // Image
    size: 'Size',
    align: 'Align',
    duplicate: 'Duplicate',
    full: 'Full',
    noImageSource: 'No image source',
  
  // History Panel
  history: 'History',
  snapshot: 'Snapshot',
  empty: 'Empty',
  restoring: 'Restoring...',
  restoreThisVersion: 'Restore this version',
  noSnapshotsYet: 'No snapshots yet',
  deleteSnapshot: 'Delete snapshot',
  deleteEmptySnapshots: 'Delete empty snapshots',
  confirmDeleteSnapshot: 'Are you sure you want to delete this snapshot?',
  confirmDeleteEmptySnapshots: 'Are you sure you want to delete {count} empty snapshot(s)?',
  failedToDelete: 'Failed to delete',
  completeSave: 'Complete save. Click to restore.',
  
  // Drawing Component
  undoLastStroke: 'Undo last stroke',
  exportAsPng: 'Export as PNG',
  makeAbsolute: 'Make absolute',
  returnToFlow: 'Return to text flow',
  
  // Link Editor
  noLink: 'No link',
  modify: 'Modify',
  removeLink: 'Remove link',
  enterUrl: 'Enter URL',
  cancel: 'Cancel',
  
  // Block Menu
  moveUp: 'Move up',
  moveDown: 'Move down',
  
  // Color Picker
  backgroundColor: 'Background color',
  
  // Drag Handle
  clickForOptions: 'Click for options',
  holdForDrag: 'Hold for drag',
  addContent: 'Add content',
  options: 'Options',
  
  // Image Component
  alignment: 'Alignment',
  widthLabel: 'Width',
  oneThirdWidth: '1/3 of width',
  twoThirdsWidth: '2/3 of width',
  fullWidthLabel: 'Full width',
  
  // Search & Drive
  searchDocuments: 'Search documents...',
  documents: 'Documents',
  folders: 'Folders',
  noResultsFound: 'No results found',
  confirmDelete: 'Are you sure you want to delete this item?',
  confirmDeleteMultiple: 'Are you sure you want to delete {count} item(s)?',
  words: 'words',
  word: 'word',
  characters: 'characters',
  character: 'character',
  images: 'images',
  image: 'image',
  drawings: 'drawings',
  drawing: 'drawing',
  emptyDocument: 'Empty document',
  viewPublic: 'View public',
  publicLabel: 'Public',
  privateLabel: 'Private',
  folder: 'Folder',
  doc: 'Doc',
  publicClickPrivate: 'Public - Click to make private',
  privateClickPublic: 'Private - Click to make public',
  makePublic: 'Make selected documents public',
  makePrivate: 'Make selected documents private',
  gridView: 'Compact grid view',
  listView: 'List view',
  cannotMoveFolder: 'Cannot move folder into its own subfolder',
  view: 'View',
  
  // File Import
  fileImported: 'File imported successfully',
  failedToImport: 'Failed to import file',
  importing: 'Importing...',
  dropFilesHere: 'Drop .txt or .md files here',
  or: 'or',
  selectFiles: 'Select Files',
  
  // Settings Page
  yourLegacyUrl: 'Your Legacy URL',
  copyUrl: 'Copy URL',
  accessibleOn: 'This page will become accessible on {date}.',
  avatarSaved: 'Avatar saved successfully',
  failedToSaveAvatar: 'Failed to save avatar',
  usernameSaved: 'Username saved successfully',
  failedToSaveUsername: 'Failed to save username',
  pleaseEnterBirthDate: 'Please enter your birth date',
  birthDateSaved: 'Birth date saved successfully',
  docsPublicOn: 'Your documents will become public on {date} (your 99th birthday)',
  failedToSaveBirthDate: 'Failed to save birth date',
  legacyDisabled: 'Digital Legacy disabled - your documents will remain private',
  failedToRemoveBirthDate: 'Failed to remove birth date',
  useGoogleAvatar: 'Use Google avatar',
  generateRandomAvatar: 'Generate random avatar',
    
    // General
    loading: 'Loading...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    language: 'Language',
    
    // Sign in
    welcomeTo: 'Welcome to',
    signInToAccess: 'Sign in to access your documents',
    signInWithGoogle: 'Sign in with Google',
    
    // Placeholder
    editorPlaceholder: 'Start typing... Create your document here',
    editorPlaceholderDoc: 'Start typing... Type / for commands',
    
    // Settings extras
    yourLegacyUrl: 'Your Legacy URL',
    legacyAccessDate: 'This page will become accessible on',
    creatingFolder: 'Creating...',
    
    // Admin Page
    adminPanel: 'Admin Panel',
    manageDocsUsersAdmins: 'Manage documents, users, and admin access',
    statistics: 'Statistics',
    usersAndAdmins: 'Users & Admins',
    totalDocuments: 'Total Documents',
    totalUsers: 'Total Users',
    totalSnapshots: 'Total Snapshots',
    recent7Days: 'Recent (7 days)',
    documentsByUser: 'Documents by User',
    noUser: 'No user',
    title: 'Title',
    user: 'User',
    created: 'Created',
    updated: 'Updated',
    snapshots: 'Snapshots',
    events: 'Events',
    actions: 'Actions',
    email: 'Email',
    firstCreated: 'First Created',
    lastActivity: 'Last Activity',
    admin: 'Admin',
    removeAdmin: 'Remove Admin',
    makeAdmin: 'Make Admin',
    failedToUpdateAdminStatus: 'Failed to update admin status',
    pageOf: 'Page {page} of {total}',
    
    // Testament Page
    digitalTestament: 'Digital Testament',
    documentsBecamePublic: 'Documents became public on',
    documentsWillBecomePublic: 'Documents will become public on',
    noDocumentsAvailable: 'No documents available yet.',
    testamentNotFound: 'Testament Not Found',
    
    // Archive Page
    archive: 'Archive',
    noPublicDocs: 'No public documents',
    thisUserNoPublicDocs: 'This user has no public documents yet.',
    loadingText: 'Loading...',
    errorText: 'Error',
    anErrorOccurred: 'An error occurred',
    failedToLoadDocuments: 'Failed to load documents',
  },
  
  fr: {
    // App
    appName: 'textpad',
    tagline: 'Un espace d\'écriture simple et élégant',
    
    // Header
    newDocument: 'Nouveau document',
    drive: 'Drive',
    settings: 'Paramètres',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    
    // Home page
    startWriting: 'Commencez à écrire...',
    saveDocument: 'Enregistrer',
    saving: 'Enregistrement...',
    savedLocally: 'Votre document est enregistré localement. Cliquez sur "Enregistrer" pour le sauvegarder définitivement.',
    clickToSave: 'Cliquez sur "Enregistrer" pour vous connecter et sauvegarder votre document.',
    
    // Drive
    myDocuments: 'Mes Documents',
    createFolder: 'Créer un dossier',
    newFolder: 'Nouveau dossier',
    noDocuments: 'Aucun document',
    createFirst: 'Créez un nouveau document pour commencer',
    searchDocuments: 'Rechercher des documents...',
    
    // Document list
    name: 'Nom',
    type: 'Type',
    date: 'Date',
    visibility: 'Visibilité',
    folder: 'Dossier',
    document: 'Document',
    untitled: 'Sans titre',
    
    // Context menu
    open: 'Ouvrir',
    viewPublic: 'Voir en public',
    delete: 'Supprimer',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer',
    words: 'mots',
    word: 'mot',
    characters: 'caractères',
    character: 'caractère',
    images: 'images',
    image: 'image',
    drawings: 'dessins',
    drawing: 'dessin',
    emptyDocument: 'Document vide',
    
    // Editor
    back: 'Retour',
    backToDrive: 'Retour au Drive',
    export: 'Exporter',
    history: 'Historique',
    copyUrl: 'Copier l\'URL',
    urlCopied: 'URL copiée',
    private: 'Privé',
    public: 'Public',
    makePrivate: 'Rendre privé',
    makePublic: 'Rendre public',
    nowPrivate: 'Maintenant privé',
    nowPublic: 'Maintenant public',
    fullWidth: 'Pleine largeur',
    normalWidth: 'Largeur normale',
    preview: 'Aperçu',
    
    // Save status
    unsavedChanges: 'Modifications non enregistrées',
    saved: 'Enregistré',
    
    // Toolbar
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    strikethrough: 'Barré',
    clearFormatting: 'Effacer le formatage',
    textColor: 'Couleur du texte',
    highlighter: 'Surligneur',
    presetColors: 'Couleurs prédéfinies',
    customColor: 'Couleur personnalisée',
    bulletList: 'Liste à puces',
    numberedList: 'Liste numérotée',
    insertImage: 'Insérer une image',
    drawingArea: 'Zone de dessin',
    insertLink: 'Insérer un lien',
    undo: 'Annuler',
    redo: 'Rétablir',
    prevFont: 'Police précédente',
    nextFont: 'Police suivante',
    brushMode: 'Mode pinceau',
    alignment: 'Alignement',
    left: 'Gauche',
    center: 'Centre',
    right: 'Droite',
    justified: 'Justifié',
    
    // Alignment
    alignLeft: 'Aligner à gauche',
    alignCenter: 'Centrer',
    alignRight: 'Aligner à droite',
    alignJustify: 'Justifier',
    
    // Context menu (editor)
    convertTo: 'Convertir en',
    blocks: 'Blocs',
    blocksHint: '(tout le paragraphe)',
    paragraph: 'Paragraphe',
    heading1: 'Titre 1',
    heading2: 'Titre 2',
    heading3: 'Titre 3',
    heading4: 'Titre 4',
    codeAndQuote: 'Code & Citation',
    codeBlock: 'Bloc de code',
    inlineCode: 'Code inline',
    quote: 'Citation',
    lists: 'Listes',
    taskList: 'Liste de tâches',
    formatting: 'Formatage',
    formattingHint: '(sélection)',
    subscript: 'Indice',
    superscript: 'Exposant',
    highlighted: 'Surligné',
    other: 'Autre',
    horizontalRule: 'Ligne horizontale',
    link: 'Lien',
    linkUrl: 'URL du lien :',
    
    // History
    documentHistory: 'Historique du document',
    noHistory: 'Aucun historique disponible',
    restore: 'Restaurer',
    restoreVersion: 'Restaurer cette version ?',
    
    // Settings
    accountSettings: 'Paramètres du compte',
    profilePicture: 'Photo de profil',
    changeAvatar: 'Changer l\'avatar',
    useGoogleAvatar: 'Utiliser l\'avatar Google',
    removeAvatar: 'Supprimer l\'avatar',
    
    // Digital Legacy
    digitalLegacy: 'Héritage numérique',
    digitalLegacySettings: 'Paramètres de l\'héritage numérique',
    digitalLegacyDescription: 'Gérez comment votre héritage numérique sera préservé et partagé.',
    digitalLegacyWarning: 'Vos écrits deviendront automatiquement accessibles au public le jour de vos 99 ans, créant votre héritage numérique.',
    dateOfBirth: 'Date de naissance',
    birthday99: 'Votre 99ème anniversaire sera le',
    noBirthDate: 'Aucune date de naissance — vos documents resteront privés pour toujours.',
    customUrlUsername: 'Nom d\'utilisateur pour l\'URL',
    usernameHint: 'Uniquement lettres minuscules, chiffres, tirets et underscores.',
    previewLegacy: 'Aperçu de l\'héritage numérique',
    previewLegacyDescription: 'Voir comment votre page publique apparaîtra.',
    
    // Public view
    allArticles: 'Tous les articles',
    previous: 'Précédent',
    next: 'Suivant',
    noTitle: 'Sans titre',
    publicDocuments: 'documents publics',
    publicDocument: 'document public',
    noPublicDocuments: 'Aucun document public',
    userNoPublicDocs: 'Cet utilisateur n\'a pas encore de documents publics.',
    
    // Footer
    credits: 'Crédits',
    madeBy: 'Créé avec soin par',
    brotherApp: 'Application sœur de',
    
    // Errors
    error: 'Erreur',
    documentNotFound: 'Document non trouvé',
    documentNotFoundDesc: 'Le document que vous recherchez n\'existe pas ou a été supprimé.',
    accessDenied: 'Accès refusé',
    documentPrivate: 'Ce document est privé et ne peut pas être consulté publiquement.',
    goHome: 'Retour à l\'accueil',
    failedToLoad: 'Échec du chargement',
    failedToUpdate: 'Échec de la mise à jour',
    
    // Image
    size: 'Taille',
    align: 'Alignement',
    duplicate: 'Dupliquer',
    full: 'Pleine',
    noImageSource: 'Aucune source d\'image',
  
  // History Panel
  history: 'Historique',
  snapshot: 'Snapshot',
  empty: 'Vide',
  restoring: 'Restauration...',
  restoreThisVersion: 'Restaurer cette version',
  noSnapshotsYet: 'Aucun snapshot pour le moment',
  deleteSnapshot: 'Supprimer le snapshot',
  deleteEmptySnapshots: 'Supprimer les snapshots vides',
  confirmDeleteSnapshot: 'Êtes-vous sûr de vouloir supprimer ce snapshot ?',
  confirmDeleteEmptySnapshots: 'Êtes-vous sûr de vouloir supprimer {count} snapshot(s) vide(s) ?',
  failedToDelete: 'Échec de la suppression',
  completeSave: 'Sauvegarde complète. Cliquez pour restaurer.',
  
  // Drawing Component
  undoLastStroke: 'Annuler le dernier trait',
  exportAsPng: 'Exporter en PNG',
  makeAbsolute: 'Rendre absolu',
  returnToFlow: 'Remettre dans le flux du texte',
  
  // Link Editor
  noLink: 'Aucun lien',
  modify: 'Modifier',
  removeLink: 'Supprimer le lien',
  enterUrl: 'Entrer l\'URL',
  
  // Block Menu
  moveUp: 'Déplacer vers le haut',
  moveDown: 'Déplacer vers le bas',
  
  // Color Picker
  backgroundColor: 'Couleur de fond',
  
  // Drag Handle
  clickForOptions: 'Cliquer pour les options',
  holdForDrag: 'Maintenir pour glisser',
  addContent: 'Ajouter du contenu',
  options: 'Options',
  
  // Image Component
  alignment: 'Alignement',
  widthLabel: 'Largeur',
  oneThirdWidth: '1/3 de la largeur',
  twoThirdsWidth: '2/3 de la largeur',
  fullWidthLabel: 'Pleine largeur',
  
  // Search & Drive
  searchDocuments: 'Rechercher des documents...',
  documents: 'Documents',
  folders: 'Dossiers',
  noResultsFound: 'Aucun résultat trouvé',
  confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  confirmDeleteMultiple: 'Êtes-vous sûr de vouloir supprimer {count} élément(s) ?',
  words: 'mots',
  word: 'mot',
  characters: 'caractères',
  character: 'caractère',
  images: 'images',
  image: 'image',
  drawings: 'dessins',
  drawing: 'dessin',
  emptyDocument: 'Document vide',
  viewPublic: 'Voir en public',
  publicLabel: 'Public',
  privateLabel: 'Privé',
  folder: 'Dossier',
  doc: 'Doc',
  publicClickPrivate: 'Public - Cliquer pour rendre privé',
  privateClickPublic: 'Privé - Cliquer pour rendre public',
  makePublic: 'Rendre les documents sélectionnés publics',
  makePrivate: 'Rendre les documents sélectionnés privés',
  gridView: 'Vue grille compacte',
  listView: 'Vue liste',
  cannotMoveFolder: 'Impossible de déplacer un dossier dans son propre sous-dossier',
  view: 'Vue',
  
  // File Import
  fileImported: 'Fichier importé avec succès',
  failedToImport: 'Échec de l\'importation du fichier',
  importing: 'Importation...',
  dropFilesHere: 'Déposez les fichiers .txt ou .md ici',
  or: 'ou',
  selectFiles: 'Sélectionner des fichiers',
  
  // Settings Page
  yourLegacyUrl: 'Votre URL de legs',
  copyUrl: 'Copier l\'URL',
  accessibleOn: 'Cette page sera accessible le {date}.',
  avatarSaved: 'Avatar enregistré avec succès',
  failedToSaveAvatar: 'Échec de l\'enregistrement de l\'avatar',
  usernameSaved: 'Nom d\'utilisateur enregistré avec succès',
  failedToSaveUsername: 'Échec de l\'enregistrement du nom d\'utilisateur',
  pleaseEnterBirthDate: 'Veuillez entrer votre date de naissance',
  birthDateSaved: 'Date de naissance enregistrée avec succès',
  docsPublicOn: 'Vos documents deviendront publics le {date} (votre 99ème anniversaire)',
  failedToSaveBirthDate: 'Échec de l\'enregistrement de la date de naissance',
  legacyDisabled: 'Legs numérique désactivé - vos documents resteront privés',
  failedToRemoveBirthDate: 'Échec de la suppression de la date de naissance',
  useGoogleAvatar: 'Utiliser l\'avatar Google',
  generateRandomAvatar: 'Générer un avatar aléatoire',
    
    // General
    loading: 'Chargement...',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    language: 'Langue',
    
    // Sign in
    welcomeTo: 'Bienvenue sur',
    signInToAccess: 'Connectez-vous pour accéder à vos documents',
    signInWithGoogle: 'Se connecter avec Google',
    
    // Placeholder
    editorPlaceholder: 'Commencez à écrire... Créez votre document ici',
    editorPlaceholderDoc: 'Commencez à écrire... Tapez / pour les commandes',
    
    // Settings extras
    yourLegacyUrl: 'Votre URL d\'héritage',
    legacyAccessDate: 'Cette page sera accessible le',
    creatingFolder: 'Création...',
    
    // Admin Page
    adminPanel: 'Panneau d\'administration',
    manageDocsUsersAdmins: 'Gérer les documents, utilisateurs et accès admin',
    statistics: 'Statistiques',
    usersAndAdmins: 'Utilisateurs & Admins',
    totalDocuments: 'Total des documents',
    totalUsers: 'Total des utilisateurs',
    totalSnapshots: 'Total des snapshots',
    recent7Days: 'Récent (7 jours)',
    documentsByUser: 'Documents par utilisateur',
    noUser: 'Aucun utilisateur',
    title: 'Titre',
    user: 'Utilisateur',
    created: 'Créé',
    updated: 'Modifié',
    snapshots: 'Snapshots',
    events: 'Événements',
    actions: 'Actions',
    email: 'Email',
    firstCreated: 'Première création',
    lastActivity: 'Dernière activité',
    admin: 'Admin',
    removeAdmin: 'Retirer Admin',
    makeAdmin: 'Rendre Admin',
    failedToUpdateAdminStatus: 'Échec de la mise à jour du statut admin',
    pageOf: 'Page {page} sur {total}',
    
    // Testament Page
    digitalTestament: 'Testament numérique',
    documentsBecamePublic: 'Documents devenus publics le',
    documentsWillBecomePublic: 'Documents deviendront publics le',
    noDocumentsAvailable: 'Aucun document disponible pour le moment.',
    testamentNotFound: 'Testament non trouvé',
    
    // Archive Page
    archive: 'Archive',
    noPublicDocs: 'Aucun document public',
    thisUserNoPublicDocs: 'Cet utilisateur n\'a pas encore de documents publics.',
    loadingText: 'Chargement...',
    errorText: 'Erreur',
    anErrorOccurred: 'Une erreur s\'est produite',
    failedToLoadDocuments: 'Échec du chargement des documents',
  },
  
  es: {
    // App
    appName: 'textpad',
    tagline: 'Un espacio de escritura simple y hermoso',
    
    // Header
    newDocument: 'Nuevo documento',
    drive: 'Drive',
    settings: 'Configuración',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    
    // Home page
    startWriting: 'Empieza a escribir...',
    saveDocument: 'Guardar documento',
    saving: 'Guardando...',
    savedLocally: 'Tu documento está guardado localmente. Haz clic en "Guardar" para guardarlo permanentemente.',
    clickToSave: 'Haz clic en "Guardar" para iniciar sesión y guardar tu documento.',
    
    // Drive
    myDocuments: 'Mis Documentos',
    createFolder: 'Crear carpeta',
    newFolder: 'Nueva carpeta',
    noDocuments: 'Sin documentos',
    createFirst: 'Crea un nuevo documento para empezar',
    searchDocuments: 'Buscar documentos...',
    
    // Document list
    name: 'Nombre',
    type: 'Tipo',
    date: 'Fecha',
    visibility: 'Visibilidad',
    folder: 'Carpeta',
    document: 'Documento',
    untitled: 'Sin título',
    
    // Context menu
    open: 'Abrir',
    viewPublic: 'Ver público',
    delete: 'Eliminar',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esto',
    words: 'palabras',
    word: 'palabra',
    characters: 'caracteres',
    character: 'carácter',
    images: 'imágenes',
    image: 'imagen',
    drawings: 'dibujos',
    drawing: 'dibujo',
    emptyDocument: 'Documento vacío',
    
    // Editor
    back: 'Volver',
    backToDrive: 'Volver al Drive',
    export: 'Exportar',
    history: 'Historial',
    copyUrl: 'Copiar URL',
    urlCopied: 'URL copiada',
    private: 'Privado',
    public: 'Público',
    makePrivate: 'Hacer privado',
    makePublic: 'Hacer público',
    nowPrivate: 'Ahora privado',
    nowPublic: 'Ahora público',
    fullWidth: 'Ancho completo',
    normalWidth: 'Ancho normal',
    preview: 'Vista previa',
    
    // Save status
    unsavedChanges: 'Cambios sin guardar',
    saved: 'Guardado',
    
    // Toolbar
    bold: 'Negrita',
    italic: 'Cursiva',
    underline: 'Subrayado',
    strikethrough: 'Tachado',
    clearFormatting: 'Limpiar formato',
    textColor: 'Color de texto',
    highlighter: 'Resaltador',
    presetColors: 'Colores predefinidos',
    customColor: 'Color personalizado',
    bulletList: 'Lista con viñetas',
    numberedList: 'Lista numerada',
    insertImage: 'Insertar imagen',
    drawingArea: 'Área de dibujo',
    insertLink: 'Insertar enlace',
    undo: 'Deshacer',
    redo: 'Rehacer',
    prevFont: 'Fuente anterior',
    nextFont: 'Fuente siguiente',
    brushMode: 'Modo pincel',
    alignment: 'Alineación',
    left: 'Izquierda',
    center: 'Centro',
    right: 'Derecha',
    justified: 'Justificado',
    
    // Alignment
    alignLeft: 'Alinear a la izquierda',
    alignCenter: 'Centrar',
    alignRight: 'Alinear a la derecha',
    alignJustify: 'Justificar',
    
    // Context menu (editor)
    convertTo: 'Convertir a',
    blocks: 'Bloques',
    blocksHint: '(todo el párrafo)',
    paragraph: 'Párrafo',
    heading1: 'Título 1',
    heading2: 'Título 2',
    heading3: 'Título 3',
    heading4: 'Título 4',
    codeAndQuote: 'Código y Cita',
    codeBlock: 'Bloque de código',
    inlineCode: 'Código en línea',
    quote: 'Cita',
    lists: 'Listas',
    taskList: 'Lista de tareas',
    formatting: 'Formato',
    formattingHint: '(selección)',
    subscript: 'Subíndice',
    superscript: 'Superíndice',
    highlighted: 'Resaltado',
    other: 'Otro',
    horizontalRule: 'Línea horizontal',
    link: 'Enlace',
    linkUrl: 'URL del enlace:',
    
    // History
    documentHistory: 'Historial del documento',
    noHistory: 'No hay historial disponible',
    restore: 'Restaurar',
    restoreVersion: '¿Restaurar esta versión?',
    
    // Settings
    accountSettings: 'Configuración de la cuenta',
    profilePicture: 'Foto de perfil',
    changeAvatar: 'Cambiar avatar',
    useGoogleAvatar: 'Usar avatar de Google',
    removeAvatar: 'Eliminar avatar',
    
    // Digital Legacy
    digitalLegacy: 'Legado digital',
    digitalLegacySettings: 'Configuración del legado digital',
    digitalLegacyDescription: 'Gestiona cómo se preservará y compartirá tu legado digital.',
    digitalLegacyWarning: 'Tus escritos se harán automáticamente públicos en tu cumpleaños número 99, creando tu legado digital.',
    dateOfBirth: 'Fecha de nacimiento',
    birthday99: 'Tu cumpleaños número 99 será el',
    noBirthDate: 'Sin fecha de nacimiento — tus documentos permanecerán privados para siempre.',
    customUrlUsername: 'Nombre de usuario para la URL',
    usernameHint: 'Solo letras minúsculas, números, guiones y guiones bajos.',
    previewLegacy: 'Vista previa del legado digital',
    previewLegacyDescription: 'Ver cómo aparecerá tu página pública.',
    
    // Public view
    allArticles: 'Todos los artículos',
    previous: 'Anterior',
    next: 'Siguiente',
    noTitle: 'Sin título',
    publicDocuments: 'documentos públicos',
    publicDocument: 'documento público',
    noPublicDocuments: 'Sin documentos públicos',
    userNoPublicDocs: 'Este usuario aún no tiene documentos públicos.',
    
    // Footer
    credits: 'Créditos',
    madeBy: 'Hecho con cariño por',
    brotherApp: 'Aplicación hermana de',
    
    // Errors
    error: 'Error',
    documentNotFound: 'Documento no encontrado',
    documentNotFoundDesc: 'El documento que buscas no existe o ha sido eliminado.',
    accessDenied: 'Acceso denegado',
    documentPrivate: 'Este documento es privado y no puede ser consultado públicamente.',
    goHome: 'Ir al inicio',
    failedToLoad: 'Error al cargar',
    failedToUpdate: 'Error al actualizar',
    
    // Image
    size: 'Tamaño',
    align: 'Alinear',
    duplicate: 'Duplicar',
    full: 'Completo',
    noImageSource: 'Sin fuente de imagen',
  
  // History Panel
  history: 'Historial',
  snapshot: 'Snapshot',
  empty: 'Vacío',
  restoring: 'Restaurando...',
  restoreThisVersion: 'Restaurar esta versión',
  noSnapshotsYet: 'Aún no hay snapshots',
  deleteSnapshot: 'Eliminar snapshot',
  deleteEmptySnapshots: 'Eliminar snapshots vacíos',
  confirmDeleteSnapshot: '¿Estás seguro de que quieres eliminar este snapshot?',
  confirmDeleteEmptySnapshots: '¿Estás seguro de que quieres eliminar {count} snapshot(s) vacío(s)?',
  failedToDelete: 'Error al eliminar',
  completeSave: 'Guardado completo. Clic para restaurar.',
  
  // Drawing Component
  undoLastStroke: 'Deshacer último trazo',
  exportAsPng: 'Exportar como PNG',
  makeAbsolute: 'Hacer absoluto',
  returnToFlow: 'Volver al flujo del texto',
  
  // Link Editor
  noLink: 'Sin enlace',
  modify: 'Modificar',
  removeLink: 'Eliminar enlace',
  enterUrl: 'Introducir URL',
  
  // Block Menu
  moveUp: 'Mover arriba',
  moveDown: 'Mover abajo',
  
  // Color Picker
  backgroundColor: 'Color de fondo',
  
  // Drag Handle
  clickForOptions: 'Clic para opciones',
  holdForDrag: 'Mantener para arrastrar',
  addContent: 'Añadir contenido',
  options: 'Opciones',
  
  // Image Component
  alignment: 'Alineación',
  widthLabel: 'Ancho',
  oneThirdWidth: '1/3 del ancho',
  twoThirdsWidth: '2/3 del ancho',
  fullWidthLabel: 'Ancho completo',
  
  // Search & Drive
  searchDocuments: 'Buscar documentos...',
  documents: 'Documentos',
  folders: 'Carpetas',
  noResultsFound: 'No se encontraron resultados',
  confirmDelete: '¿Estás seguro de que quieres eliminar este elemento?',
  confirmDeleteMultiple: '¿Estás seguro de que quieres eliminar {count} elemento(s)?',
  words: 'palabras',
  word: 'palabra',
  characters: 'caracteres',
  character: 'carácter',
  images: 'imágenes',
  image: 'imagen',
  drawings: 'dibujos',
  drawing: 'dibujo',
  emptyDocument: 'Documento vacío',
  viewPublic: 'Ver público',
  publicLabel: 'Público',
  privateLabel: 'Privado',
  folder: 'Carpeta',
  doc: 'Doc',
  publicClickPrivate: 'Público - Clic para hacer privado',
  privateClickPublic: 'Privado - Clic para hacer público',
  makePublic: 'Hacer públicos los documentos seleccionados',
  makePrivate: 'Hacer privados los documentos seleccionados',
  gridView: 'Vista de cuadrícula compacta',
  listView: 'Vista de lista',
  cannotMoveFolder: 'No se puede mover una carpeta a su propia subcarpeta',
  view: 'Vista',
  
  // File Import
  fileImported: 'Archivo importado con éxito',
  failedToImport: 'Error al importar archivo',
  importing: 'Importando...',
  dropFilesHere: 'Suelta archivos .txt o .md aquí',
  or: 'o',
  selectFiles: 'Seleccionar archivos',
  
  // Settings Page
  yourLegacyUrl: 'Tu URL de legado',
  copyUrl: 'Copiar URL',
  accessibleOn: 'Esta página será accesible el {date}.',
  avatarSaved: 'Avatar guardado con éxito',
  failedToSaveAvatar: 'Error al guardar avatar',
  usernameSaved: 'Nombre de usuario guardado con éxito',
  failedToSaveUsername: 'Error al guardar nombre de usuario',
  pleaseEnterBirthDate: 'Por favor, introduce tu fecha de nacimiento',
  birthDateSaved: 'Fecha de nacimiento guardada con éxito',
  docsPublicOn: 'Tus documentos serán públicos el {date} (tu 99º cumpleaños)',
  failedToSaveBirthDate: 'Error al guardar fecha de nacimiento',
  legacyDisabled: 'Legado digital desactivado - tus documentos permanecerán privados',
  failedToRemoveBirthDate: 'Error al eliminar fecha de nacimiento',
  useGoogleAvatar: 'Usar avatar de Google',
  generateRandomAvatar: 'Generar avatar aleatorio',
    
    // General
    loading: 'Cargando...',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    language: 'Idioma',
    
    // Sign in
    welcomeTo: 'Bienvenido a',
    signInToAccess: 'Inicia sesión para acceder a tus documentos',
    signInWithGoogle: 'Iniciar sesión con Google',
    
    // Placeholder
    editorPlaceholder: 'Empieza a escribir... Crea tu documento aquí',
    editorPlaceholderDoc: 'Empieza a escribir... Escribe / para comandos',
    
    // Settings extras
    yourLegacyUrl: 'Tu URL de legado',
    legacyAccessDate: 'Esta página será accesible el',
    creatingFolder: 'Creando...',
    
    // Admin Page
    adminPanel: 'Panel de administración',
    manageDocsUsersAdmins: 'Gestionar documentos, usuarios y acceso admin',
    statistics: 'Estadísticas',
    usersAndAdmins: 'Usuarios & Admins',
    totalDocuments: 'Total de documentos',
    totalUsers: 'Total de usuarios',
    totalSnapshots: 'Total de snapshots',
    recent7Days: 'Reciente (7 días)',
    documentsByUser: 'Documentos por usuario',
    noUser: 'Sin usuario',
    title: 'Título',
    user: 'Usuario',
    created: 'Creado',
    updated: 'Actualizado',
    snapshots: 'Snapshots',
    events: 'Eventos',
    actions: 'Acciones',
    email: 'Email',
    firstCreated: 'Primera creación',
    lastActivity: 'Última actividad',
    admin: 'Admin',
    removeAdmin: 'Quitar Admin',
    makeAdmin: 'Hacer Admin',
    failedToUpdateAdminStatus: 'Error al actualizar estado de admin',
    pageOf: 'Página {page} de {total}',
    
    // Testament Page
    digitalTestament: 'Testamento digital',
    documentsBecamePublic: 'Los documentos se hicieron públicos el',
    documentsWillBecomePublic: 'Los documentos serán públicos el',
    noDocumentsAvailable: 'No hay documentos disponibles todavía.',
    testamentNotFound: 'Testamento no encontrado',
    
    // Archive Page
    archive: 'Archivo',
    noPublicDocs: 'Sin documentos públicos',
    thisUserNoPublicDocs: 'Este usuario aún no tiene documentos públicos.',
    loadingText: 'Cargando...',
    errorText: 'Error',
    anErrorOccurred: 'Ha ocurrido un error',
    failedToLoadDocuments: 'Error al cargar documentos',
  },
  
  zh: {
    // App
    appName: 'textpad',
    tagline: '简单优雅的写作空间',
    
    // Header
    newDocument: '新建文档',
    drive: '云盘',
    settings: '设置',
    signIn: '登录',
    signOut: '退出',
    
    // Home page
    startWriting: '开始写作...',
    saveDocument: '保存文档',
    saving: '保存中...',
    savedLocally: '您的文档已本地保存。点击"保存"永久保存。',
    clickToSave: '点击"保存"登录并永久保存您的文档。',
    
    // Drive
    myDocuments: '我的文档',
    createFolder: '创建文件夹',
    newFolder: '新文件夹',
    noDocuments: '暂无文档',
    createFirst: '创建新文档开始使用',
    searchDocuments: '搜索文档...',
    
    // Document list
    name: '名称',
    type: '类型',
    date: '日期',
    visibility: '可见性',
    folder: '文件夹',
    document: '文档',
    untitled: '无标题',
    
    // Context menu
    open: '打开',
    viewPublic: '公开查看',
    delete: '删除',
    deleteConfirm: '确定要删除吗',
    words: '字',
    word: '字',
    characters: '字符',
    character: '字符',
    images: '图片',
    image: '图片',
    drawings: '绘图',
    drawing: '绘图',
    emptyDocument: '空文档',
    
    // Editor
    back: '返回',
    backToDrive: '返回云盘',
    export: '导出',
    history: '历史',
    copyUrl: '复制链接',
    urlCopied: '链接已复制',
    private: '私密',
    public: '公开',
    makePrivate: '设为私密',
    makePublic: '设为公开',
    nowPrivate: '已设为私密',
    nowPublic: '已设为公开',
    fullWidth: '全宽',
    normalWidth: '标准宽度',
    preview: '预览',
    
    // Save status
    unsavedChanges: '未保存的更改',
    saved: '已保存',
    
    // Toolbar
    bold: '粗体',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    clearFormatting: '清除格式',
    textColor: '文字颜色',
    highlighter: '高亮',
    presetColors: '预设颜色',
    customColor: '自定义颜色',
    bulletList: '项目符号列表',
    numberedList: '编号列表',
    insertImage: '插入图片',
    drawingArea: '绘图区域',
    insertLink: '插入链接',
    undo: '撤销',
    redo: '重做',
    prevFont: '上一个字体',
    nextFont: '下一个字体',
    brushMode: '画笔模式',
    alignment: '对齐',
    left: '左',
    center: '居中',
    right: '右',
    justified: '两端对齐',
    
    // Alignment
    alignLeft: '左对齐',
    alignCenter: '居中',
    alignRight: '右对齐',
    alignJustify: '两端对齐',
    
    // Context menu (editor)
    convertTo: '转换为',
    blocks: '块',
    blocksHint: '（整个段落）',
    paragraph: '段落',
    heading1: '标题1',
    heading2: '标题2',
    heading3: '标题3',
    heading4: '标题4',
    codeAndQuote: '代码和引用',
    codeBlock: '代码块',
    inlineCode: '行内代码',
    quote: '引用',
    lists: '列表',
    taskList: '任务列表',
    formatting: '格式',
    formattingHint: '（选中内容）',
    subscript: '下标',
    superscript: '上标',
    highlighted: '高亮',
    other: '其他',
    horizontalRule: '分隔线',
    link: '链接',
    linkUrl: '链接地址：',
    
    // History
    documentHistory: '文档历史',
    noHistory: '暂无历史记录',
    restore: '恢复',
    restoreVersion: '恢复此版本？',
    
    // Settings
    accountSettings: '账户设置',
    profilePicture: '头像',
    changeAvatar: '更换头像',
    useGoogleAvatar: '使用Google头像',
    removeAvatar: '删除头像',
    
    // Digital Legacy
    digitalLegacy: '数字遗产',
    digitalLegacySettings: '数字遗产设置',
    digitalLegacyDescription: '管理您的数字遗产如何被保存和分享。',
    digitalLegacyWarning: '您的文章将在您99岁生日时自动公开，创建您的数字遗产。',
    dateOfBirth: '出生日期',
    birthday99: '您的99岁生日是',
    noBirthDate: '未设置出生日期——您的文档将永远保持私密。',
    customUrlUsername: '自定义URL用户名',
    usernameHint: '仅限小写字母、数字、连字符和下划线。',
    previewLegacy: '预览数字遗产',
    previewLegacyDescription: '查看您的公开页面将如何显示。',
    
    // Public view
    allArticles: '所有文章',
    previous: '上一篇',
    next: '下一篇',
    noTitle: '无标题',
    publicDocuments: '篇公开文档',
    publicDocument: '篇公开文档',
    noPublicDocuments: '暂无公开文档',
    userNoPublicDocs: '该用户暂无公开文档。',
    
    // Footer
    credits: '关于',
    madeBy: '用心制作',
    brotherApp: '姊妹应用',
    
    // Errors
    error: '错误',
    documentNotFound: '文档未找到',
    documentNotFoundDesc: '您查找的文档不存在或已被删除。',
    accessDenied: '访问被拒绝',
    documentPrivate: '此文档为私密文档，无法公开访问。',
    goHome: '返回首页',
    failedToLoad: '加载失败',
    failedToUpdate: '更新失败',
    
    // Image
    size: '大小',
    align: '对齐',
    duplicate: '复制',
    full: '全部',
    noImageSource: '无图片来源',
    
    // History Panel
    history: '历史记录',
    snapshot: '快照',
    empty: '空',
    restoring: '正在恢复...',
    restoreThisVersion: '恢复此版本',
    noSnapshotsYet: '暂无快照',
    deleteSnapshot: '删除快照',
    deleteEmptySnapshots: '删除空快照',
    confirmDeleteSnapshot: '确定要删除此快照吗？',
    confirmDeleteEmptySnapshots: '确定要删除{count}个空快照吗？',
    failedToDelete: '删除失败',
    completeSave: '完整保存。点击恢复。',
    
    // Drawing Component
    undoLastStroke: '撤销最后一笔',
    exportAsPng: '导出为PNG',
    makeAbsolute: '设为绝对定位',
    returnToFlow: '返回文本流',
    
    // Link Editor
    noLink: '无链接',
    modify: '修改',
    removeLink: '删除链接',
    enterUrl: '输入URL',
    
    // Block Menu
    moveUp: '向上移动',
    moveDown: '向下移动',
    
    // Color Picker
    backgroundColor: '背景颜色',
    
    // Drag Handle
    clickForOptions: '点击查看选项',
    holdForDrag: '按住拖动',
    addContent: '添加内容',
    options: '选项',
    
    // Image Component
    alignment: '对齐',
    widthLabel: '宽度',
    oneThirdWidth: '1/3宽度',
    twoThirdsWidth: '2/3宽度',
    fullWidthLabel: '全宽',
    
    // Search & Drive
    searchDocuments: '搜索文档...',
    documents: '文档',
    folders: '文件夹',
    noResultsFound: '未找到结果',
    confirmDelete: '确定要删除此项吗？',
    confirmDeleteMultiple: '确定要删除 {count} 个项目吗？',
    words: '个字',
    word: '个字',
    characters: '个字符',
    character: '个字符',
    images: '张图片',
    image: '张图片',
    drawings: '幅画',
    drawing: '幅画',
    emptyDocument: '空文档',
    viewPublic: '查看公开页面',
    publicLabel: '公开',
    privateLabel: '私密',
    folder: '文件夹',
    doc: '文档',
    publicClickPrivate: '公开 - 点击设为私密',
    privateClickPublic: '私密 - 点击设为公开',
    makePublic: '将选中文档设为公开',
    makePrivate: '将选中文档设为私密',
    gridView: '紧凑网格视图',
    listView: '列表视图',
    cannotMoveFolder: '无法将文件夹移动到其自身的子文件夹中',
    view: '视图',
    
    // File Import
    fileImported: '文件导入成功',
    failedToImport: '导入文件失败',
    importing: '导入中...',
    dropFilesHere: '将 .txt 或 .md 文件拖放到这里',
    or: '或',
    selectFiles: '选择文件',
    
    // Settings Page
    yourLegacyUrl: '您的遗产URL',
    copyUrl: '复制URL',
    accessibleOn: '此页面将于{date}可访问。',
    avatarSaved: '头像保存成功',
    failedToSaveAvatar: '保存头像失败',
    usernameSaved: '用户名保存成功',
    failedToSaveUsername: '保存用户名失败',
    pleaseEnterBirthDate: '请输入您的出生日期',
    birthDateSaved: '出生日期保存成功',
    docsPublicOn: '您的文档将于{date}（您的99岁生日）公开',
    failedToSaveBirthDate: '保存出生日期失败',
    legacyDisabled: '数字遗产已禁用 - 您的文档将保持私密',
    failedToRemoveBirthDate: '删除出生日期失败',
    useGoogleAvatar: '使用Google头像',
    generateRandomAvatar: '生成随机头像',
    
    // General
    loading: '加载中...',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    close: '关闭',
    yes: '是',
    no: '否',
    language: '语言',
    
    // Sign in
    welcomeTo: '欢迎使用',
    signInToAccess: '登录以访问您的文档',
    signInWithGoogle: '使用Google登录',
    
    // Placeholder
    editorPlaceholder: '开始写作... 在这里创建您的文档',
    editorPlaceholderDoc: '开始写作... 输入 / 查看命令',
    
    // Settings extras
    yourLegacyUrl: '您的遗产链接',
    legacyAccessDate: '此页面将于以下日期开放',
    creatingFolder: '创建中...',
    
    // Admin Page
    adminPanel: '管理面板',
    manageDocsUsersAdmins: '管理文档、用户和管理员权限',
    statistics: '统计',
    usersAndAdmins: '用户和管理员',
    totalDocuments: '文档总数',
    totalUsers: '用户总数',
    totalSnapshots: '快照总数',
    recent7Days: '最近7天',
    documentsByUser: '按用户分类的文档',
    noUser: '无用户',
    title: '标题',
    user: '用户',
    created: '创建时间',
    updated: '更新时间',
    snapshots: '快照',
    events: '事件',
    actions: '操作',
    email: '邮箱',
    firstCreated: '首次创建',
    lastActivity: '最后活动',
    admin: '管理员',
    removeAdmin: '移除管理员',
    makeAdmin: '设为管理员',
    failedToUpdateAdminStatus: '更新管理员状态失败',
    pageOf: '第 {page} 页，共 {total} 页',
    
    // Testament Page
    digitalTestament: '数字遗嘱',
    documentsBecamePublic: '文档于以下日期公开',
    documentsWillBecomePublic: '文档将于以下日期公开',
    noDocumentsAvailable: '暂无可用文档。',
    testamentNotFound: '未找到遗嘱',
    
    // Archive Page
    archive: '档案',
    noPublicDocs: '无公开文档',
    thisUserNoPublicDocs: '该用户暂无公开文档。',
    loadingText: '加载中...',
    errorText: '错误',
    anErrorOccurred: '发生错误',
    failedToLoadDocuments: '加载文档失败',
  },
  
  ru: {
    // App
    appName: 'textpad',
    tagline: 'Простое и красивое пространство для письма',
    
    // Header
    newDocument: 'Новый документ',
    drive: 'Диск',
    settings: 'Настройки',
    signIn: 'Войти',
    signOut: 'Выйти',
    
    // Home page
    startWriting: 'Начните писать...',
    saveDocument: 'Сохранить документ',
    saving: 'Сохранение...',
    savedLocally: 'Ваш документ сохранён локально. Нажмите "Сохранить" для постоянного сохранения.',
    clickToSave: 'Нажмите "Сохранить" для входа и сохранения документа.',
    
    // Drive
    myDocuments: 'Мои документы',
    createFolder: 'Создать папку',
    newFolder: 'Новая папка',
    noDocuments: 'Нет документов',
    createFirst: 'Создайте новый документ для начала',
    searchDocuments: 'Поиск документов...',
    
    // Document list
    name: 'Название',
    type: 'Тип',
    date: 'Дата',
    visibility: 'Видимость',
    folder: 'Папка',
    document: 'Документ',
    untitled: 'Без названия',
    
    // Context menu
    open: 'Открыть',
    viewPublic: 'Публичный просмотр',
    delete: 'Удалить',
    deleteConfirm: 'Вы уверены, что хотите удалить',
    words: 'слов',
    word: 'слово',
    characters: 'символов',
    character: 'символ',
    images: 'изображений',
    image: 'изображение',
    drawings: 'рисунков',
    drawing: 'рисунок',
    emptyDocument: 'Пустой документ',
    
    // Editor
    back: 'Назад',
    backToDrive: 'Вернуться на Диск',
    export: 'Экспорт',
    history: 'История',
    copyUrl: 'Копировать ссылку',
    urlCopied: 'Ссылка скопирована',
    private: 'Приватный',
    public: 'Публичный',
    makePrivate: 'Сделать приватным',
    makePublic: 'Сделать публичным',
    nowPrivate: 'Теперь приватный',
    nowPublic: 'Теперь публичный',
    fullWidth: 'Полная ширина',
    normalWidth: 'Обычная ширина',
    preview: 'Предпросмотр',
    
    // Save status
    unsavedChanges: 'Несохранённые изменения',
    saved: 'Сохранено',
    
    // Toolbar
    bold: 'Жирный',
    italic: 'Курсив',
    underline: 'Подчёркнутый',
    strikethrough: 'Зачёркнутый',
    clearFormatting: 'Очистить форматирование',
    textColor: 'Цвет текста',
    highlighter: 'Выделитель',
    presetColors: 'Предустановленные цвета',
    customColor: 'Пользовательский цвет',
    bulletList: 'Маркированный список',
    numberedList: 'Нумерованный список',
    insertImage: 'Вставить изображение',
    drawingArea: 'Область рисования',
    insertLink: 'Вставить ссылку',
    undo: 'Отменить',
    redo: 'Повторить',
    prevFont: 'Предыдущий шрифт',
    nextFont: 'Следующий шрифт',
    brushMode: 'Режим кисти',
    alignment: 'Выравнивание',
    left: 'Влево',
    center: 'По центру',
    right: 'Вправо',
    justified: 'По ширине',
    
    // Alignment
    alignLeft: 'По левому краю',
    alignCenter: 'По центру',
    alignRight: 'По правому краю',
    alignJustify: 'По ширине',
    
    // Context menu (editor)
    convertTo: 'Преобразовать в',
    blocks: 'Блоки',
    blocksHint: '(весь абзац)',
    paragraph: 'Абзац',
    heading1: 'Заголовок 1',
    heading2: 'Заголовок 2',
    heading3: 'Заголовок 3',
    heading4: 'Заголовок 4',
    codeAndQuote: 'Код и цитата',
    codeBlock: 'Блок кода',
    inlineCode: 'Встроенный код',
    quote: 'Цитата',
    lists: 'Списки',
    taskList: 'Список задач',
    formatting: 'Форматирование',
    formattingHint: '(выделение)',
    subscript: 'Нижний индекс',
    superscript: 'Верхний индекс',
    highlighted: 'Выделенный',
    other: 'Другое',
    horizontalRule: 'Горизонтальная линия',
    link: 'Ссылка',
    linkUrl: 'URL ссылки:',
    
    // History
    documentHistory: 'История документа',
    noHistory: 'История недоступна',
    restore: 'Восстановить',
    restoreVersion: 'Восстановить эту версию?',
    
    // Settings
    accountSettings: 'Настройки аккаунта',
    profilePicture: 'Фото профиля',
    changeAvatar: 'Изменить аватар',
    useGoogleAvatar: 'Использовать аватар Google',
    removeAvatar: 'Удалить аватар',
    
    // Digital Legacy
    digitalLegacy: 'Цифровое наследие',
    digitalLegacySettings: 'Настройки цифрового наследия',
    digitalLegacyDescription: 'Управляйте тем, как ваше цифровое наследие будет сохранено и опубликовано.',
    digitalLegacyWarning: 'Ваши записи автоматически станут публичными в ваш 99-й день рождения, создавая ваше цифровое наследие.',
    dateOfBirth: 'Дата рождения',
    birthday99: 'Ваш 99-й день рождения',
    noBirthDate: 'Дата рождения не указана — ваши документы останутся приватными навсегда.',
    customUrlUsername: 'Пользовательское имя для URL',
    usernameHint: 'Только строчные буквы, цифры, дефисы и подчёркивания.',
    previewLegacy: 'Предпросмотр цифрового наследия',
    previewLegacyDescription: 'Посмотрите, как будет выглядеть ваша публичная страница.',
    
    // Public view
    allArticles: 'Все статьи',
    previous: 'Предыдущий',
    next: 'Следующий',
    noTitle: 'Без названия',
    publicDocuments: 'публичных документов',
    publicDocument: 'публичный документ',
    noPublicDocuments: 'Нет публичных документов',
    userNoPublicDocs: 'У этого пользователя пока нет публичных документов.',
    
    // Footer
    credits: 'О проекте',
    madeBy: 'Сделано с заботой',
    brotherApp: 'Родственное приложение',
    
    // Errors
    error: 'Ошибка',
    documentNotFound: 'Документ не найден',
    documentNotFoundDesc: 'Документ, который вы ищете, не существует или был удалён.',
    accessDenied: 'Доступ запрещён',
    documentPrivate: 'Этот документ приватный и недоступен публично.',
    goHome: 'На главную',
    failedToLoad: 'Ошибка загрузки',
    failedToUpdate: 'Ошибка обновления',
    
    // Image
    size: 'Размер',
    align: 'Выравнивание',
    duplicate: 'Дублировать',
    full: 'Полный',
    noImageSource: 'Нет источника изображения',
    
    // History Panel
    history: 'История',
    snapshot: 'Снимок',
    empty: 'Пустой',
    restoring: 'Восстановление...',
    restoreThisVersion: 'Восстановить эту версию',
    noSnapshotsYet: 'Снимков пока нет',
    deleteSnapshot: 'Удалить снимок',
    deleteEmptySnapshots: 'Удалить пустые снимки',
    confirmDeleteSnapshot: 'Вы уверены, что хотите удалить этот снимок?',
    confirmDeleteEmptySnapshots: 'Вы уверены, что хотите удалить {count} пустой(ых) снимок(ов)?',
    failedToDelete: 'Ошибка удаления',
    completeSave: 'Полное сохранение. Нажмите для восстановления.',
    
    // Drawing Component
    undoLastStroke: 'Отменить последний штрих',
    exportAsPng: 'Экспорт в PNG',
    makeAbsolute: 'Сделать абсолютным',
    returnToFlow: 'Вернуть в текстовый поток',
    
    // Link Editor
    noLink: 'Нет ссылки',
    modify: 'Изменить',
    removeLink: 'Удалить ссылку',
    enterUrl: 'Введите URL',
    
    // Block Menu
    moveUp: 'Переместить вверх',
    moveDown: 'Переместить вниз',
    
    // Color Picker
    backgroundColor: 'Цвет фона',
    
    // Drag Handle
    clickForOptions: 'Нажмите для опций',
    holdForDrag: 'Удерживайте для перетаскивания',
    addContent: 'Добавить контент',
    options: 'Опции',
    
    // Image Component
    alignment: 'Выравнивание',
    widthLabel: 'Ширина',
    oneThirdWidth: '1/3 ширины',
    twoThirdsWidth: '2/3 ширины',
    fullWidthLabel: 'Полная ширина',
    
    // Search & Drive
    searchDocuments: 'Искать документы...',
    documents: 'Документы',
    folders: 'Папки',
    noResultsFound: 'Ничего не найдено',
    confirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
    confirmDeleteMultiple: 'Вы уверены, что хотите удалить {count} элемент(ов)?',
    words: 'слов',
    word: 'слово',
    characters: 'символов',
    character: 'символ',
    images: 'изображений',
    image: 'изображение',
    drawings: 'рисунков',
    drawing: 'рисунок',
    emptyDocument: 'Пустой документ',
    viewPublic: 'Посмотреть публично',
    publicLabel: 'Публичный',
    privateLabel: 'Приватный',
    folder: 'Папка',
    doc: 'Документ',
    publicClickPrivate: 'Публичный - Нажмите, чтобы сделать приватным',
    privateClickPublic: 'Приватный - Нажмите, чтобы сделать публичным',
    makePublic: 'Сделать выбранные документы публичными',
    makePrivate: 'Сделать выбранные документы приватными',
    gridView: 'Компактный вид сетки',
    listView: 'Вид списка',
    cannotMoveFolder: 'Невозможно переместить папку в её собственную подпапку',
    view: 'Вид',
    
    // File Import
    fileImported: 'Файл успешно импортирован',
    failedToImport: 'Ошибка импорта файла',
    importing: 'Импорт...',
    dropFilesHere: 'Перетащите файлы .txt или .md сюда',
    or: 'или',
    selectFiles: 'Выбрать файлы',
    
    // Settings Page
    yourLegacyUrl: 'Ваш URL наследия',
    copyUrl: 'Копировать URL',
    accessibleOn: 'Эта страница станет доступной {date}.',
    avatarSaved: 'Аватар успешно сохранён',
    failedToSaveAvatar: 'Ошибка сохранения аватара',
    usernameSaved: 'Имя пользователя успешно сохранено',
    failedToSaveUsername: 'Ошибка сохранения имени пользователя',
    pleaseEnterBirthDate: 'Пожалуйста, введите дату рождения',
    birthDateSaved: 'Дата рождения успешно сохранена',
    docsPublicOn: 'Ваши документы станут публичными {date} (ваш 99-й день рождения)',
    failedToSaveBirthDate: 'Ошибка сохранения даты рождения',
    legacyDisabled: 'Цифровое наследие отключено - ваши документы останутся приватными',
    failedToRemoveBirthDate: 'Ошибка удаления даты рождения',
    useGoogleAvatar: 'Использовать аватар Google',
    generateRandomAvatar: 'Создать случайный аватар',
    
    // General
    loading: 'Загрузка...',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    close: 'Закрыть',
    yes: 'Да',
    no: 'Нет',
    language: 'Язык',
    
    // Sign in
    welcomeTo: 'Добро пожаловать в',
    signInToAccess: 'Войдите для доступа к документам',
    signInWithGoogle: 'Войти через Google',
    
    // Placeholder
    editorPlaceholder: 'Начните писать... Создайте свой документ здесь',
    editorPlaceholderDoc: 'Начните писать... Введите / для команд',
    
    // Settings extras
    yourLegacyUrl: 'URL вашего наследия',
    legacyAccessDate: 'Эта страница станет доступна',
    creatingFolder: 'Создание...',
    
    // Admin Page
    adminPanel: 'Панель администратора',
    manageDocsUsersAdmins: 'Управление документами, пользователями и доступом администратора',
    statistics: 'Статистика',
    usersAndAdmins: 'Пользователи и Администраторы',
    totalDocuments: 'Всего документов',
    totalUsers: 'Всего пользователей',
    totalSnapshots: 'Всего снимков',
    recent7Days: 'За последние 7 дней',
    documentsByUser: 'Документы по пользователям',
    noUser: 'Без пользователя',
    title: 'Заголовок',
    user: 'Пользователь',
    created: 'Создан',
    updated: 'Обновлён',
    snapshots: 'Снимки',
    events: 'События',
    actions: 'Действия',
    email: 'Email',
    firstCreated: 'Первое создание',
    lastActivity: 'Последняя активность',
    admin: 'Админ',
    removeAdmin: 'Убрать администратора',
    makeAdmin: 'Сделать администратором',
    failedToUpdateAdminStatus: 'Не удалось обновить статус администратора',
    pageOf: 'Страница {page} из {total}',
    
    // Testament Page
    digitalTestament: 'Цифровое завещание',
    documentsBecamePublic: 'Документы стали публичными',
    documentsWillBecomePublic: 'Документы станут публичными',
    noDocumentsAvailable: 'Документы пока недоступны.',
    testamentNotFound: 'Завещание не найдено',
    
    // Archive Page
    archive: 'Архив',
    noPublicDocs: 'Нет публичных документов',
    thisUserNoPublicDocs: 'У этого пользователя пока нет публичных документов.',
    loadingText: 'Загрузка...',
    errorText: 'Ошибка',
    anErrorOccurred: 'Произошла ошибка',
    failedToLoadDocuments: 'Не удалось загрузить документы',
  },
}

/**
 * Get translation for a specific locale
 */
export function getTranslation(locale) {
  return translations[locale] || translations[defaultLocale]
}

/**
 * Get browser locale
 */
export function getBrowserLocale() {
  if (typeof window === 'undefined') return defaultLocale
  
  const browserLang = navigator.language || navigator.userLanguage
  const shortLang = browserLang.split('-')[0]
  
  if (locales.includes(shortLang)) {
    return shortLang
  }
  
  return defaultLocale
}

