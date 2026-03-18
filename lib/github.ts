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
  console.log('getRepoInfo:', { owner, repo, hasToken: Boolean(process.env.GITHUB_TOKEN) })
  const { data } = await octokit.repos.get({ owner, repo }) 
  console.log('getRepoInfo done:', { name: data.name, stars: data.stargazers_count })
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
  console.log('getRepoFiles:', { owner, repo, hasToken: Boolean(process.env.GITHUB_TOKEN) })
  const { data: tree } = await octokit.git.getTree({ 
    owner, 
    repo, 
    tree_sha: 'HEAD', 
    recursive: '1', 
  }) 
  console.log('getRepoFiles tree size:', Array.isArray(tree.tree) ? tree.tree.length : 0)
  
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
  console.log('getRepoFiles candidate code files:', codeFiles.length)
  
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
  
  console.log('getRepoFiles done:', filesWithContent.filter(Boolean).length)
  return filesWithContent.filter(Boolean) as Array<{  
    path: string; content: string  
  }> 
} 
