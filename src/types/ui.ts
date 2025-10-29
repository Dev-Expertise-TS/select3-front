// UI 컴포넌트 관련 타입 정의
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

// 버튼 컴포넌트 타입
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

// 입력 필드 컴포넌트 타입
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  helperText?: string
}

// 선택 필드 컴포넌트 타입
export interface SelectProps extends BaseComponentProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  helperText?: string
  multiple?: boolean
  searchable?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

// 모달 컴포넌트 타입
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

// 카드 컴포넌트 타입
export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  actions?: React.ReactNode
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

// 리스트 컴포넌트 타입
export interface ListProps extends BaseComponentProps {
  items: ListItem[]
  loading?: boolean
  emptyMessage?: string
  onItemClick?: (item: ListItem) => void
  renderItem?: (item: ListItem) => React.ReactNode
}

export interface ListItem {
  id: string
  title: string
  subtitle?: string
  image?: string
  metadata?: any
}

// 테이블 컴포넌트 타입
export interface TableProps extends BaseComponentProps {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  sortable?: boolean
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: any) => void
  selectable?: boolean
  onSelectionChange?: (selectedRows: any[]) => void
}

export interface TableColumn {
  key: string
  title: string
  width?: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

// 폼 컴포넌트 타입
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void
  onReset?: () => void
  loading?: boolean
  error?: string
  success?: string
  validation?: FormValidation
}

export interface FormValidation {
  [key: string]: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
  }
}

// 로딩 컴포넌트 타입
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  overlay?: boolean
  fullScreen?: boolean
}

// 에러 컴포넌트 타입
export interface ErrorProps extends BaseComponentProps {
  title?: string
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

// 빈 상태 컴포넌트 타입
export interface EmptyStateProps extends BaseComponentProps {
  title: string
  description?: string
  image?: string
  action?: React.ReactNode
}

// 페이지네이션 컴포넌트 타입
export interface PaginationProps extends BaseComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
}

// 탭 컴포넌트 타입
export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
}

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

// 드롭다운 컴포넌트 타입
export interface DropdownProps extends BaseComponentProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  onItemClick?: (item: DropdownItem) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

export interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
}

// 툴팁 컴포넌트 타입
export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode
  trigger: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
}

// 알림 컴포넌트 타입
export interface AlertProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  actions?: React.ReactNode
}

// 배지 컴포넌트 타입
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

// 아바타 컴포넌트 타입
export interface AvatarProps extends BaseComponentProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  shape?: 'circle' | 'square'
}

// 프로그레스 컴포넌트 타입
export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  animated?: boolean
}
