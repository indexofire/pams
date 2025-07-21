export default {
  // Common
  common: {
    systemName: 'Pathogen Analysis Management System',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    select: 'Select',
    upload: 'Upload',
    download: 'Download',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    view: 'View',
    details: 'Details',
    settings: 'Settings',
    help: 'Help',
    about: 'About'
  },

  // Navigation menu
  nav: {
    dashboard: 'Dashboard',
    strains: 'Strain Management',
    strainAnalysis: 'Strain Screening Analysis',
    genomes: 'Genome Management',
    analysis: 'Bioinformatics Analysis',
    annotation: 'Genome Annotation',
    mlst: 'MLST Analysis',
    serotyping: 'Serotyping',
    virulence: 'Virulence Genes',
    resistance: 'Resistance Genes',
    phylogeny: 'Phylogenetic Analysis',
    reports: 'Report Center',
    systemManagement: 'System Management',
    systemSettings: 'System Settings',
    roleManagement: 'Role & Permission Management',
    securityAudit: 'Security Audit',
    logout: 'Logout'
  },

  // Login page
  login: {
    title: 'PAMS Pathogen Analysis Management System',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    usernameRequired: 'Please enter username',
    passwordRequired: 'Please enter password',
    invalidCredentials: 'Invalid username or password'
  },

  // Strain management
  strains: {
    title: 'Strain Management',
    strainId: 'Strain ID',
    strainName: 'Strain Name',
    species: 'Species',
    region: 'Region',
    sampleSource: 'Sample Source',
    experimentType: 'Experiment Type',
    isolationDate: 'Isolation Date',
    description: 'Description',
    createStrain: 'Create Strain',
    editStrain: 'Edit Strain',
    deleteStrain: 'Delete Strain',
    batchDelete: 'Batch Delete',
    strainIdRequired: 'Please enter strain ID',
    strainNameRequired: 'Please enter strain name',
    speciesRequired: 'Please select species',
    regionRequired: 'Please select region',
    sampleSourceRequired: 'Please select sample source',
    createSuccess: 'Strain created successfully',
    updateSuccess: 'Strain updated successfully',
    deleteSuccess: 'Strain deleted successfully',
    deleteFailed: 'Failed to delete strain',
    strainIdExists: 'Strain ID already exists',
    confirmDelete: 'Are you sure you want to delete this strain?',
    confirmBatchDelete: 'Are you sure you want to delete {count} selected strains?'
  },

  // Genome management
  genomes: {
    title: 'Genome Management',
    fileName: 'File Name',
    fileSize: 'File Size',
    uploadDate: 'Upload Date',
    associatedStrain: 'Associated Strain',
    sequenceCount: 'Sequence Count',
    totalLength: 'Total Length',
    gcContent: 'GC Content',
    n50: 'N50',
    sequencingPlatform: 'Sequencing Platform',
    sequencingMode: 'Sequencing Mode',
    assemblySoftware: 'Assembly Software',
    assemblyVersion: 'Software Version',
    sequencingDepth: 'Sequencing Depth',
    n50Value: 'N50 Value',
    uploadGenome: 'Upload Genome',
    selectFiles: 'Select Files',
    startUpload: 'Start Upload',
    uploadSuccess: 'Upload successful',
    uploadFailed: 'Upload failed',
    analysisResults: 'Analysis Results',
    basicInfo: 'Basic Info',
    qualityReport: 'Quality Report',
    sequencingInfo: 'Sequencing and Assembly Info',
    autoAssociate: 'Auto Associate',
    selectStrain: 'Select associated strain',
    selectPlatform: 'Select sequencing platform',
    selectMode: 'Select sequencing mode',
    softwarePlaceholder: 'e.g. SPAdes, Canu, Flye',
    versionPlaceholder: 'e.g. v3.15.4',
    depthUnit: 'Sequencing depth (X)',
    n50Unit: 'N50 value (bp)'
  },

  // Bioinformatics analysis
  analysis: {
    title: 'Bioinformatics Analysis',
    mlst: {
      title: 'MLST Analysis',
      description: 'Multi-Locus Sequence Typing Analysis',
      selectGenomes: 'Select Genomes',
      analysisOptions: 'Analysis Options',
      startAnalysis: 'Start Analysis',
      results: 'Analysis Results',
      sequenceType: 'Sequence Type',
      scheme: 'Scheme',
      alleles: 'Alleles',
      confidence: 'Confidence'
    },
    serotyping: {
      title: 'Serotyping Analysis',
      description: 'Serotype Prediction Analysis',
      serotype: 'Serotype',
      antigens: 'Antigens',
      method: 'Method'
    },
    virulence: {
      title: 'Virulence Gene Detection',
      description: 'Virulence Gene Identification and Annotation',
      geneName: 'Gene Name',
      geneFamily: 'Gene Family',
      identity: 'Identity',
      coverage: 'Coverage'
    },
    resistance: {
      title: 'Resistance Gene Detection',
      description: 'Resistance Gene Identification',
      resistanceClass: 'Resistance Class',
      antibiotic: 'Antibiotic',
      mechanism: 'Mechanism'
    }
  },

  // System settings
  settings: {
    title: 'System Settings',
    experimentSettings: 'Experiment Settings',
    systemSettings: 'System Settings',
    speciesManagement: 'Species Management',
    regionManagement: 'Region Management',
    sampleSourceManagement: 'Sample Source Management',
    experimentTypeManagement: 'Experiment Type Management',
    databaseManagement: 'Database Management',
    permissionManagement: 'Permission Management',
    roleManagement: 'Role Management',
    permissionList: 'Permission List',
    userRoles: 'User Roles',
    createRole: 'Create Role',
    editRole: 'Edit Role',
    roleName: 'Role Name',
    roleIdentifier: 'Role Identifier',
    roleDescription: 'Role Description',
    permissionSettings: 'Permission Settings',
    systemRole: 'System Role',
    userCount: 'User Count',
    permissionCount: 'Permission Count',
    healthCheck: 'Health Check',
    optimizeDatabase: 'Optimize Database',
    migrationHistory: 'Migration History',
    databaseStatus: 'Database Status',
    tableIntegrity: 'Table Integrity',
    indexStatus: 'Index Status',
    databaseSize: 'Database Size'
  },

  // Form validation
  validation: {
    required: 'This field is required',
    minLength: 'Please enter at least {min} characters',
    maxLength: 'Please enter no more than {max} characters',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    number: 'Please enter a valid number',
    integer: 'Please enter a valid integer',
    positive: 'Please enter a positive number',
    range: 'Please enter a value between {min} and {max}'
  },

  // Messages
  messages: {
    saveSuccess: 'Saved successfully',
    saveFailed: 'Save failed',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed',
    updateSuccess: 'Updated successfully',
    updateFailed: 'Update failed',
    createSuccess: 'Created successfully',
    createFailed: 'Create failed',
    uploadSuccess: 'Uploaded successfully',
    uploadFailed: 'Upload failed',
    loadFailed: 'Load failed',
    networkError: 'Network error',
    serverError: 'Server error',
    permissionDenied: 'Permission denied',
    operationSuccess: 'Operation successful',
    operationFailed: 'Operation failed',
    confirmOperation: 'Are you sure you want to perform this operation?',
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    logoutSuccess: 'Logout successful',
    logoutFailed: 'Logout failed'
  },

  // Pagination
  pagination: {
    total: 'Total {total} items',
    page: 'Page {current}',
    pageSize: '{size} items per page',
    goto: 'Go to',
    prev: 'Previous',
    next: 'Next'
  },

  // Date time
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastYear: 'Last Year'
  }
}
