import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileCardExample() {
  return (
    <ProfileCard
      name="Javi A. Torres"
      title="Software Engineer"
      handle="javicodes"
      status="Online"
      contactText="Contact"
      avatarUrl="/path/to/portrait.png"
      iconUrl="/assets/demo/iconpattern.png"
      holo={0.5}
      glare={0.2}
      tiltStrength={2}
      parallax={2}
      patternSize="66px 66px"
      radius={8}
      enableTilt={true}
      intro={true}
      showUserInfo={true}
      enableMobileTilt={false}
      theme="dark"
      onContactClick={() => console.log('Contact clicked')}
    />
  );
}
