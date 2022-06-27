import { useRouter } from 'next/router'
function Projects() {
  const router = useRouter()
  const { code } = router.query

  return <div>EditProjectPage - {code}</div>
}

export default Projects
