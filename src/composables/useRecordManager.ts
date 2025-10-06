/**
 * @file useRecordManager.ts
 * @description 계산 기록 관리를 위한 컴포저블
 */

import { useCalcStore } from 'stores/calcStore';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import Papa from 'papaparse';

export function useRecordManager() {
  const $q = useQuasar();
  const { t } = useI18n();
  const calcStore = useCalcStore();

  const clearRecords = () => {
    $q.dialog({
      title: t('clearRecords.confirmTitle'),
      message: t('clearRecords.confirmMessage'),
      ok: {
        label: t('message.yes'),
        flat: true,
      },
      cancel: {
        label: t('message.no'),
        flat: true,
      },
      persistent: true,
    }).onOk(() => {
      calcStore.calc.record.clearRecords();
      $q.notify({ type: 'positive', message: t('clearRecords.success') });
    });
  };

  const exportRecordsToCSV = () => {
    try {
      const records = calcStore.calc.record.getAllRecords();
      if (records.length === 0) {
        $q.notify({ type: 'warning', message: t('exportRecords.noData') });
        return;
      }

      const dataToExport = records.map((record) => ({
        id: record.id,
        previousNumber: record.calculationResult.previousNumber,
        operator: Array.isArray(record.calculationResult.operator)
          ? record.calculationResult.operator.join(',')
          : record.calculationResult.operator,
        argumentNumber: record.calculationResult.argumentNumber,
        resultNumber: record.calculationResult.resultNumber,
        memo: record.memo,
        timestamp: record.timestamp,
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qcalc-records.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      $q.notify({ type: 'positive', message: t('exportRecords.success') });
    } catch (error) {
      console.error(error);
      $q.notify({ type: 'negative', message: t('exportRecords.fail') });
    }
  };

  const importRecordsFromCSV = (file: File) => {
    $q.dialog({
      title: t('importRecords.confirmTitle'),
      message: t('importRecords.confirmMessage'),
      ok: {
        label: t('message.yes'),
        flat: true,
      },
      cancel: {
        label: t('message.no'),
        flat: true,
      },
      persistent: true,
    }).onOk(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              const newRecords = results.data as Record<string, unknown>[];
              if (newRecords.length > 0) {
                calcStore.calc.record.clearRecords();
                // The records are added in reverse order to maintain the original order
                for (let i = newRecords.length - 1; i >= 0; i--) {
                  const record = newRecords[i];
                  if (!record) continue;

                  const operatorValue = record.operator;
                  const operator =
                    typeof operatorValue === 'string' && operatorValue.includes(',')
                      ? operatorValue.split(',')
                      : operatorValue;
                  calcStore.calc.record.addRecord({
                    previousNumber: String(record.previousNumber),
                    operator: operator,
                    argumentNumber: String(record.argumentNumber),
                    resultNumber: String(record.resultNumber),
                  });
                }
                // Manually set memo and timestamp as addRecord does not support them
                const allRecords = calcStore.calc.record.getAllRecords();
                for (let i = 0; i < newRecords.length; i++) {
                  const newRecord = newRecords[i];
                  if (!newRecord) continue;
                  const correspondingRecord = allRecords.find(
                    (r) =>
                      r.calculationResult.resultNumber === newRecord.resultNumber &&
                      r.calculationResult.previousNumber === newRecord.previousNumber,
                  );
                  if (correspondingRecord) {
                    correspondingRecord.memo = newRecord.memo as string;
                    correspondingRecord.timestamp = parseInt(newRecord.timestamp as string, 10);
                  }
                }

                $q.notify({ type: 'positive', message: t('importRecords.success') });
              } else {
                throw new Error('Invalid records format');
              }
            },
          });
        } catch (error) {
          console.error(error);
          $q.notify({ type: 'negative', message: t('importRecords.fail') });
        }
      };
      reader.readAsText(file);
    });
  };

  return {
    clearRecords,
    exportRecordsToCSV,
    importRecordsFromCSV,
  };
}
