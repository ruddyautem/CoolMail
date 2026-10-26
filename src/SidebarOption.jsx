import './SidebarOption.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SidebarOption({ Icon, title, number, selected }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div role='button' tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }} className={`sidebarOption ${selected && 'sidebarOption--active'}`} onClick={handleClick}>
      <Icon />
      <h3>{title}</h3>
      {number && <p>{number}</p>}
    </div>
  );
}

export default SidebarOption;