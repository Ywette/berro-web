import { ExcursionsBoardClient } from "@/components/staff/excursions-board-client";
import { listManagedExcursions } from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function ExcursionsBoard() {
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;

  let excursions;
  try {
    excursions = await listManagedExcursions();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : labels.excursionsLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-medium text-ivory">{labels.excursionsTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">{labels.excursionsBody}</p>
      </div>
      <ExcursionsBoardClient
        excursions={excursions}
        labels={{
          boardTitle: labels.excursionsTitle,
          empty: labels.excursionsEmpty,
          add: labels.addExcursion,
          edit: labels.editExcursion,
          delete: labels.deleteExcursion,
          routeColumn: labels.excursionFormRoute,
          regionColumn: labels.excursionFormRegion,
          addTitle: labels.excursionFormAddTitle,
          editTitle: labels.excursionFormEditTitle,
          close: labels.excursionFormClose,
          save: labels.saveExcursion,
          saving: labels.savingExcursion,
          title: labels.excursionFormTitle,
          route: labels.excursionFormRoute,
          routeHint: labels.excursionFormRouteHint,
          teaser: labels.excursionFormTeaser,
          teaserHint: labels.excursionFormTeaserHint,
          region: labels.excursionFormRegion,
          regionNone: labels.excursionFormRegionNone,
          regionLatvia: dictionary.excursions.filterLatvia,
          regionFrance: dictionary.excursions.filterFrance,
          regionBaltics: dictionary.excursions.filterBaltics,
          regionGermany: dictionary.excursions.filterGermany,
          photos: labels.excursionFormPhotos,
          photosHint: labels.excursionFormPhotosHint,
          uploadPhotos: labels.excursionFormUploadPhotos,
          mainPhoto: labels.excursionFormMainPhoto,
          setMainPhoto: labels.excursionFormSetMainPhoto,
          movePhotoLeft: labels.excursionFormMovePhotoLeft,
          movePhotoRight: labels.excursionFormMovePhotoRight,
          removePhoto: labels.excursionFormRemovePhoto,
        }}
      />
    </div>
  );
}
