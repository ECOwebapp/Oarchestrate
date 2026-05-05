import { useAddressStore } from "./address";
import { useContactStore } from "./contact";
import { useDesignStore } from "./design";
import { useGenderStore } from "./gender";
import { useMemberStore } from "./member";
import { usePosStore } from "./positions";
import { useProjectStore } from "./projects";
import { useSubtaskStore } from "./subtasks";
import { useTaskStore } from "./tasks";
import { useUnitStore } from "./unit";
import { useNotifStore } from "./useNotifStore";

export const reset = async () => {
  await Promise.resolve().then(() => {
    useAddressStore().addressReset();
    useContactStore().contactReset();
    useDesignStore().designReset();
    useGenderStore().genderReset();
    useMemberStore().memReset();
    usePosStore().posReset();
    useProjectStore().projectsReset();
    useSubtaskStore().subtaskReset();
    useTaskStore().taskReset();
    useUnitStore().unitReset();
    useNotifStore().notifReset();
  });
};
