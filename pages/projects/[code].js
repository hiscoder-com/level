function EditProjectPage() {
  const router = useRouter()
  const { code } = router.query
  return <div>EditProjectPage - {code}</div>
}

export default EditProjectPage
