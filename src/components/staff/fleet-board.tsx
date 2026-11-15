import { FleetBoardClient } from "@/components/staff/fleet-board-client";
import { listVehicles } from "@/lib/data/vehicles";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function FleetBoard() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  let vehicles;

  try {
    vehicles = await listVehicles();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dictionary.staffDashboard.fleetLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <FleetBoardClient
        vehicles={vehicles}
        locale={locale}
        labels={{
          passengers: dictionary.fleet.passengers,
          fleetTitle: dictionary.staffDashboard.fleetTitle,
          plate: dictionary.staffDashboard.plate,
          capacity: dictionary.staffDashboard.capacity,
          insurance: dictionary.staffDashboard.insurance,
          inspection: dictionary.staffDashboard.inspection,
          availableIn: dictionary.staffDashboard.availableIn,
          noExpiry: dictionary.staffDashboard.noExpiry,
          fleetEmpty: dictionary.staffDashboard.fleetEmpty,
          addTransport: dictionary.staffDashboard.addTransport,
          editTransport: dictionary.staffDashboard.editTransport,
          addTitle: dictionary.staffDashboard.fleetFormAddTitle,
          editTitle: dictionary.staffDashboard.fleetFormEditTitle,
          close: dictionary.staffDashboard.fleetFormClose,
          saveTransport: dictionary.staffDashboard.saveTransport,
          savingTransport: dictionary.staffDashboard.savingTransport,
          deleteTransport: dictionary.staffDashboard.deleteTransport,
          kind: dictionary.staffDashboard.fleetKind,
          kindVan: dictionary.staffDashboard.fleetKindVan,
          kindCoach: dictionary.staffDashboard.fleetKindCoach,
          kindVip: dictionary.staffDashboard.fleetKindVip,
          kindRetro: dictionary.staffDashboard.fleetKindRetro,
          name: dictionary.staffDashboard.fleetFormName,
          guideSeats: dictionary.staffDashboard.fleetFormGuideSeats,
          interiorColor: dictionary.staffDashboard.fleetFormInterior,
          bodyColor: dictionary.staffDashboard.fleetFormBody,
          extras: dictionary.staffDashboard.fleetFormExtras,
          extrasHint: dictionary.staffDashboard.fleetFormExtrasHint,
          summary: dictionary.staffDashboard.fleetFormSummary,
          description: dictionary.staffDashboard.fleetFormDescription,
          descriptionHint: dictionary.staffDashboard.fleetFormDescriptionHint,
          closingNotes: dictionary.staffDashboard.fleetFormClosingNotes,
          closingNotesHint: dictionary.staffDashboard.fleetFormClosingNotesHint,
          photos: dictionary.staffDashboard.fleetFormPhotos,
          photosHint: dictionary.staffDashboard.fleetFormPhotosHint,
          uploadPhotos: dictionary.staffDashboard.fleetFormUploadPhotos,
          mainPhoto: dictionary.staffDashboard.fleetFormMainPhoto,
          setMainPhoto: dictionary.staffDashboard.fleetFormSetMainPhoto,
          movePhotoLeft: dictionary.staffDashboard.fleetFormMovePhotoLeft,
          movePhotoRight: dictionary.staffDashboard.fleetFormMovePhotoRight,
          removePhoto: dictionary.staffDashboard.fleetFormRemovePhoto,
          videoUrl: dictionary.staffDashboard.fleetFormVideo,
          countriesHint: dictionary.staffDashboard.fleetFormCountriesHint,
        }}
      />
    </div>
  );
}
