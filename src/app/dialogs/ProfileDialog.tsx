import { Check } from 'lucide-react';
import { useState } from 'react';
import { Character, Modal } from '../../components';
import type { Grade, Save } from '../../game';
import GradePicker from '../../GradePicker';

export default function ProfileDialog({
  save,
  onClose,
  onNameChange,
  onGradeChange,
}: {
  save: Save;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onGradeChange: (grade: Grade) => void;
}) {
  const [nameDraft, setNameDraft] = useState(save.name);
  return (
    <Modal title="Your explorer profile" onClose={onClose} className="profile-modal">
      <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
      <h1>Hello, little adventurer.</h1>
      <p>Every great story starts with a name.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNameChange(nameDraft);
          onClose();
        }}
      >
        <label>
          Your explorer name
          <input
            autoFocus
            maxLength={24}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Explorer"
          />
        </label>
        <GradePicker compact grade={save.grade} onSelect={onGradeChange} />
        <p className="form-helper">
          You can change your level anytime. Your adventures at each level stay saved.
        </p>
        <button className="button primary full" type="submit">
          That’s me!
          <Check size={18} />
        </button>
      </form>
    </Modal>
  );
}
