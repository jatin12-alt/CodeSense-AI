import { Octokit } from '@octokit/rest' 
  
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN, 
}) 
  
export function parseGitHubUrl(url: string): {  
  owner: string; repo: string  
} { 
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/) 
  if (!match) throw new Error('Invalid GitHub URL') 
  return {  
    owner: match[1],  
    repo: match[2].replace('.git', '')  
  } 
} 
  
export async function getRepoInfo(owner: string, repo: string) { 
  const { data } = await octokit.repos.get({ owner, repo }) 
  return { 
    name: data.name, 
    description: data.description, 
    language: data.language, 
    stars: data.stargazers_count, 
    url: data.html_url, 
  } 
} 
  
export async function getRepoFiles( 
  owner: string, 
  repo: string 
): Promise<Array<{ path: string; content: string }>> { 
  const { data: tree } = await octokit.git.getTree({ 
    owner, 
    repo, 
    tree_sha: 'HEAD', 
    recursive: '1', 
  }) 
  
  const codeExtensions = [ 
    '.ts', '.tsx', '.js', '.jsx', '.py', '.java', 
    '.go', '.rs', '.cpp', '.c', '.cs', '.php', 
    '.rb', '.swift', '.kt', '.md', '.json', 
    '.yaml', '.yml', '.prisma', '.sql', 
    '.graphql', '.html', '.css', '.scss' 
  ] 
  
  const codeFiles = tree.tree.filter(file => 
    file.type === 'blob' && 
    file.path && 
    codeExtensions.some(ext => file.path!.endsWith(ext)) && 
    !file.path.includes('node_modules') && 
    !file.path.includes('.next') && 
    !file.path.includes('dist') && 
    !file.path.includes('package-lock.json') 
  ) 
  
  const filesWithContent = await Promise.all( 
    codeFiles.slice(0, 50).map(async (file) => { 
      try { 
        const { data } = await octokit.repos.getContent({ 
          owner, repo, path: file.path!, 
        }) 
        if ('content' in data) { 
          const content = Buffer.from( 
            data.content, 'base64' 
          ).toString('utf-8') 
          return { path: file.path!, content } 
        } 
        return null 
      } catch { return null } 
    }) 
  ) 
  
  return filesWithContent.filter(Boolean) as Array<{  
    path: string; content: string  
  }> 
} 
