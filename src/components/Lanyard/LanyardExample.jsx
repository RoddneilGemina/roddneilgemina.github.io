import Lanyard from './Lanyard';

export default function LanyardExample() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Lanyard
        frontImage="/card-front.png"
        backImage="/card-back.png"
        strapImage="/band.png"
        cardColor="#ffffff"
        strapColor="#111111"
        finish="holographic"
        metal="silver"
        interactive={true}
        intro={true}
      />
    </div>
  );
}
