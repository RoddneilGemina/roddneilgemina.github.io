import GridMotion from './GridMotion';

const items = [
  { image: 'images/resutex.png', title: 'ResuTex', badge: 'LaTeX ATS Studio', projectId: 'p13' },
  { image: 'images/aicquire.png', title: 'aicquire', badge: 'AI Hiring ATS', projectId: 'p12' },
  { image: 'images/fusionrush.jpg', title: 'Fusion Rush', badge: "ICETT '26", projectId: 'p1' },
  { image: 'images/visualai.jpg', title: 'Visual AI Proof Parser', badge: "PCSC '26", projectId: 'p2' },
  { image: 'images/refertoire.png', title: 'Refertoire PWA', badge: '100% Offline PWA', projectId: 'p9' },
  { image: 'images/gigipos.png', title: 'GigiPOS Platform', badge: 'Modern Retail POS', projectId: 'p10' }
];

export default function GridMotionExample() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 600 }}>
      <GridMotion
        items={items}
        rows={4}
        aspectRatio={1.33}
        gap={16}
        radius={14}
        angle={-12}
        tilt={0}
        speed={24}
        direction="alternate"
        parallax={0.5}
        spotlight={0.6}
        dim={0.35}
        fade={0.5}
        grayscale={false}
      />
    </div>
  );
}
