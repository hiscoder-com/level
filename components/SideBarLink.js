const SideBarLink = ({ href, text }) => {
  return (
    <li>
      <a href={href} className="sidebar-link-a">
        <span className="tracking-wide truncate">{text}</span>
      </a>
    </li>
  )
}

export default SideBarLink
