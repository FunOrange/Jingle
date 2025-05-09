import React from 'react';
import '../../style/iconButton.css';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
  unseenAnnouncement?: boolean;
}
export default function IconButton({ img, ...props }: IconButtonProps) {
  return (
    <button
      className={'icon-button'}
      style={{ backgroundImage: `url(${img})` }}
      {...props}
    >
      {props.unseenAnnouncement && (
        <span className='notification-badge'>1</span>
      )}
    </button>
  );
}
