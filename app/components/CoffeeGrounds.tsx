function CoffeeGrounds() {
  const coffeeTexture = useTexture("coffee-ground.webp");

  useEffect(() => {
    coffeeTexture.wrapS = coffeeTexture.wrapT = THREE.RepeatWrapping;
    coffeeTexture.repeat.set(2, 1);
  }, [coffeeTexture]);

  return (
    <mesh position={[0, 0.48, 0]}>
      <cylinderGeometry args={[0.36, 0.36, 0.2, 32]} />
      <meshStandardMaterial
        map={coffeeTexture}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}
