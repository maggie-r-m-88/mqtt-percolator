import styles from "./StartSwitch.module.scss";
type StartSwitchProps = {
  isOn: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export default function StartSwitch({
  isOn,
  onStart,
  onStop,
  disabled = false,
}: StartSwitchProps) {
  return (
    <label className={`${styles.switch} ${disabled ? styles.disabled : ""}`}>
  <input
    type="checkbox"
    checked={isOn}
    disabled={disabled}
    onChange={(e) => {
      e.target.checked ? onStart() : onStop();
    }}
  />
  <div className={styles.button}>
    <div className={styles.light} />
    <div className={styles.dots} />
    <div className={styles.characters} />
    <div className={styles.shine} />
    <div className={styles.shadow} />
  </div>
</label>

  );
}
