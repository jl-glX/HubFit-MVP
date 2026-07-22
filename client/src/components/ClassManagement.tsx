import { useState } from "react";
import { Trash2, Edit2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useAdminClasses, type AdminClass } from "../hooks/useAdminClasses";
import { useUsers } from "../hooks/useUsers";
import { ClassForm } from "./ClassForm";
import { formatDate } from "../lib/dateUtils";
import { useTranslation } from "react-i18next";
import { localizeClass } from "../lib/classLocalization";

export function ClassManagement() {
  const { t } = useTranslation();
  const { classes, loading, error, deleteClass, refreshClasses } =
    useAdminClasses();
  const { users } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<AdminClass | null>(null);
  const [filterTrainer, setFilterTrainer] = useState<string>("all");

  const trainers = users.filter((u) => u.role === "trainer");
  const filteredClasses =
    filterTrainer === "all"
      ? classes
      : classes.filter((c) => c.trainerId === filterTrainer);

  const handleDeleteClass = async (classId: string) => {
    if (confirm(t("admin.deleteClassConfirm"))) {
      try {
        await deleteClass(classId);
      } catch (err) {
        console.error("Error deleting class:", err);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const handleFormSuccess = () => {
    refreshClasses();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        {t("common.loadingClasses")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {t("common.errorPrefix", { error })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">
            {t("admin.filterTrainer")}
          </label>
          <select
            value={filterTrainer}
            onChange={(e) => setFilterTrainer(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t("admin.allTrainers")}</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>
        </div>

        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" />
          {t("admin.newClass")}
        </Button>
      </div>

      {showForm && (
        <ClassForm
          gymClass={editingClass}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {filteredClasses.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          {t("admin.noClasses")}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClasses.map((gymClass) => (
            <div
              key={gymClass.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {localizeClass(gymClass.name, gymClass.description, t).name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {
                      localizeClass(gymClass.name, gymClass.description, t)
                        .description
                    }
                  </p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">{t("common.trainer")}</p>
                      <p className="font-medium text-gray-900">
                        {gymClass.trainerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t("common.dateTime")}</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(gymClass.scheduledAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t("common.capacity")}</p>
                      <p className="font-medium text-gray-900">
                        {gymClass.bookedCount}/{gymClass.maxCapacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t("common.waitlist")}</p>
                      <p className="font-medium text-gray-900">
                        {gymClass.waitlistCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end sm:justify-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingClass(gymClass);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(gymClass.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
