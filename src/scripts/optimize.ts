// 코드 정리 및 최적화를 위한 스크립트
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// 불필요한 console.log 제거
export function removeConsoleLogs(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // console.log를 devLog로 교체
    const updatedContent = content
      .replace(/console\.log\(/g, 'devLog(')
      .replace(/console\.warn\(/g, 'devError(')
      .replace(/console\.error\(/g, 'devError(')
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Updated console logs in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// 불필요한 import 제거
export function removeUnusedImports(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // 사용되지 않는 import 패턴 제거
    const lines = content.split('\n')
    const updatedLines = lines.filter(line => {
      // 빈 import 제거
      if (line.trim().startsWith('import') && line.includes('{}')) {
        return false
      }
      
      // 사용되지 않는 import 제거 (간단한 휴리스틱)
      if (line.trim().startsWith('import') && line.includes('unused')) {
        return false
      }
      
      return true
    })
    
    if (lines.length !== updatedLines.length) {
      writeFileSync(filePath, updatedLines.join('\n'), 'utf8')
      console.log(`✅ Removed unused imports in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// TODO 주석 제거
export function removeTodoComments(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // TODO, FIXME, HACK, XXX 주석 제거
    const updatedContent = content
      .replace(/\/\/\s*TODO.*$/gm, '')
      .replace(/\/\/\s*FIXME.*$/gm, '')
      .replace(/\/\/\s*HACK.*$/gm, '')
      .replace(/\/\/\s*XXX.*$/gm, '')
      .replace(/\/\*\s*TODO[\s\S]*?\*\//g, '')
      .replace(/\/\*\s*FIXME[\s\S]*?\*\//g, '')
      .replace(/\/\*\s*HACK[\s\S]*?\*\//g, '')
      .replace(/\/\*\s*XXX[\s\S]*?\*\//g, '')
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Removed TODO comments in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// 빈 줄 정리
export function cleanEmptyLines(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // 연속된 빈 줄을 하나로 정리
    const updatedContent = content
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s*\n/g, '')
      .replace(/\n\s*$/g, '\n')
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Cleaned empty lines in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// 타입 안전성 개선
export function improveTypeSafety(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    let updatedContent = content
    
    // any 타입을 unknown으로 교체
    updatedContent = updatedContent.replace(/: any/g, ': unknown')
    
    // 타입 가드 추가
    updatedContent = updatedContent.replace(
      /if \(([^)]+)\)/g,
      'if ($1 && typeof $1 === \'object\')'
    )
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Improved type safety in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// 성능 최적화 적용
export function applyPerformanceOptimizations(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    let updatedContent = content
    
    // useMemo 추가
    updatedContent = updatedContent.replace(
      /const (\w+) = (.*?);/g,
      (match, varName, expression) => {
        if (expression.includes('filter') || expression.includes('map') || expression.includes('reduce')) {
          return `const ${varName} = useMemo(() => ${expression}, [dependencies]);`
        }
        return match
      }
    )
    
    // useCallback 추가
    updatedContent = updatedContent.replace(
      /const (\w+) = \(([^)]*)\) => {/g,
      (match, funcName, params) => {
        if (funcName.includes('handle') || funcName.includes('on')) {
          return `const ${funcName} = useCallback((${params}) => {`
        }
        return match
      }
    )
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Applied performance optimizations in ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error)
  }
}

// 전체 프로젝트 최적화
export function optimizeProject() {
  console.log('🚀 Starting project optimization...')
  
  // TypeScript 파일들 찾기
  const files = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim())
  
  console.log(`📁 Found ${files.length} TypeScript files`)
  
  files.forEach(file => {
    console.log(`🔧 Optimizing ${file}...`)
    
    removeConsoleLogs(file)
    removeUnusedImports(file)
    removeTodoComments(file)
    cleanEmptyLines(file)
    improveTypeSafety(file)
    applyPerformanceOptimizations(file)
  })
  
  console.log('✅ Project optimization completed!')
}

// 개별 파일 최적화
export function optimizeFile(filePath: string) {
  console.log(`🔧 Optimizing ${filePath}...`)
  
  removeConsoleLogs(filePath)
  removeUnusedImports(filePath)
  removeTodoComments(filePath)
  cleanEmptyLines(filePath)
  improveTypeSafety(filePath)
  applyPerformanceOptimizations(filePath)
  
  console.log(`✅ Optimization completed for ${filePath}`)
}

// 사용법 예시
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    optimizeProject()
  } else {
    args.forEach(file => optimizeFile(file))
  }
}
