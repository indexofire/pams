// 图标配置文件 - 统一管理第三方图标库
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 导入Font Awesome图标
import {
  faUser,
  faUserMd,
  faUsers,
  faMars,
  faVenus,
  faGenderless,
  faIdCard,
  faBaby,
  faChild,
  faUserTie,
  faFlask,
  faMicroscope,
  faVial,
  faPills,
  faHospital,
  faCalendarAlt,
  faClock,
  faStopwatch,
  faUpload,
  faDownload,
  faPlus,
  faTrash,
  faSearch,
  faFilter,
  faRefresh,
  faEye,
  faEdit,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faQuestionCircle,
  faDatabase,
  faDna,
  faAtom,
  faBug,
  faVirus,
  faBacteria
} from '@fortawesome/free-solid-svg-icons'

// 将图标添加到库中
library.add(
  faUser,
  faUserMd,
  faUsers,
  faMars,
  faVenus,
  faGenderless,
  faIdCard,
  faBaby,
  faChild,
  faUserTie,
  faFlask,
  faMicroscope,
  faVial,
  faPills,
  faHospital,
  faCalendarAlt,
  faClock,
  faStopwatch,
  faUpload,
  faDownload,
  faPlus,
  faTrash,
  faSearch,
  faFilter,
  faRefresh,
  faEye,
  faEdit,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faQuestionCircle,
  faDatabase,
  faDna,
  faAtom,
  faBug,
  faVirus,
  faBacteria
)

// 图标映射配置
export const iconConfig = {
  // 样本信息图标
  patient: {
    name: { type: 'iconpark', icon: 'People', color: '#409EFF' },
    gender: {
      male: { type: 'fontawesome', icon: 'mars', color: '#409EFF' },
      female: { type: 'fontawesome', icon: 'venus', color: '#F56C6C' },
      unknown: { type: 'fontawesome', icon: 'genderless', color: '#909399' }
    },
    age: { type: 'fontawesome', icon: 'baby', color: '#E6A23C' },
    idCard: { type: 'fontawesome', icon: 'id-card', color: '#67C23A' }
  },

  // 日期相关图标
  dates: {
    onset: { type: 'fontawesome', icon: 'pills', color: '#E74C3C' },
    sampling: { type: 'fontawesome', icon: 'vial', color: '#3498DB' },
    isolation: { type: 'fontawesome', icon: 'microscope', color: '#E6A23C' },
    submission: { type: 'fontawesome', icon: 'hospital', color: '#27AE60' }
  },

  // 操作按钮图标
  actions: {
    add: { type: 'fontawesome', icon: 'plus', color: '#ffffff' },
    upload: { type: 'iconpark', icon: 'UploadIcon', color: '#ffffff' },
    download: { type: 'iconpark', icon: 'DownloadIcon', color: '#ffffff' },
    delete: { type: 'fontawesome', icon: 'trash', color: '#ffffff' },
    search: { type: 'fontawesome', icon: 'search', color: '#909399' },
    edit: { type: 'fontawesome', icon: 'edit', color: '#409EFF' },
    view: { type: 'fontawesome', icon: 'eye', color: '#67C23A' }
  },

  // 生物学相关图标
  biology: {
    dna: { type: 'fontawesome', icon: 'dna', color: '#8E44AD' },
    bacteria: { type: 'fontawesome', icon: 'bacteria', color: '#E67E22' },
    virus: { type: 'fontawesome', icon: 'virus', color: '#E74C3C' },
    flask: { type: 'fontawesome', icon: 'flask', color: '#3498DB' }
  }
}

// 导出Font Awesome组件
export { FontAwesomeIcon }

// 图标渲染辅助函数
export const renderIcon = (iconConfig, size = '16px') => {
  if (iconConfig.type === 'fontawesome') {
    return {
      component: FontAwesomeIcon,
      props: {
        icon: iconConfig.icon,
        style: {
          color: iconConfig.color,
          fontSize: size
        }
      }
    }
  }
  // 其他图标库的渲染逻辑可以在这里扩展
  return null
}
