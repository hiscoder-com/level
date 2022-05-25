import React from 'react'

const SideBarLink = ({ href, link }) => {
  return (
    <li>
      <a href={href.path} className="sidebar-link-a">
        <span className="tracking-wide truncate">{link.text}</span>
      </a>
    </li>
  )
}

export default SideBarLink
