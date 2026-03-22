import { describe, it, expect, vi, beforeEach } from 'vitest';

// i18n 의존성 mock
vi.mock('src/i18n/initLocale', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { CalculatorRecord } from '../calculator/CalculatorRecord';
import { Operator } from '../calculator/Calculator';

function makeResult(prev: string, op: Operator, arg: string, result: string): CalculationResult {
  return {
    previousNumber: prev,
    operator: op,
    argumentNumber: arg,
    resultNumber: result,
  };
}

describe('CalculatorRecord', () => {
  let record: CalculatorRecord;

  beforeEach(() => {
    record = new CalculatorRecord();
  });

  describe('addRecord', () => {
    it('기록 추가', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      expect(record.getCount()).toBe(1);
    });

    it('LIFO 구조: 최신 기록이 앞에 위치', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('10', Operator.MUL, '5', '50'));
      const all = record.getAllRecords();
      expect(all[0]!.calculationResult.resultNumber).toBe('50');
      expect(all[1]!.calculationResult.resultNumber).toBe('3');
    });

    it('ID가 자동으로 증가', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      const all = record.getAllRecords();
      expect(all[0]!.id).toBe(2);
      expect(all[1]!.id).toBe(1);
    });

    it('최대 100개 초과 시 오래된 항목 제거', () => {
      for (let i = 0; i < 101; i++) {
        record.addRecord(makeResult(i.toString(), Operator.ADD, '1', (i + 1).toString()));
      }
      expect(record.getCount()).toBe(100);
    });

    it('mode 파라미터 기본값은 calc', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      const all = record.getAllRecords();
      expect(all[0]!.mode).toBe('calc');
    });

    it('mode 파라미터를 formula로 설정', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'), 'formula', '1+2');
      const all = record.getAllRecords();
      expect(all[0]!.mode).toBe('formula');
      expect(all[0]!.expression).toBe('1+2');
    });
  });

  describe('deleteRecord', () => {
    it('ID로 기록 삭제', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      record.deleteRecord(1);
      expect(record.getCount()).toBe(1);
      expect(record.getAllRecords()[0]!.id).toBe(2);
    });

    it('존재하지 않는 ID 삭제 시 에러', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      expect(() => record.deleteRecord(999)).toThrow();
    });
  });

  describe('clearRecords', () => {
    it('모든 기록 삭제', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      record.clearRecords();
      expect(record.getCount()).toBe(0);
      expect(record.getAllRecords()).toEqual([]);
    });

    it('빈 기록에서 clearRecords 호출해도 에러 없음', () => {
      expect(() => record.clearRecords()).not.toThrow();
      expect(record.getCount()).toBe(0);
    });
  });

  describe('getAllRecords', () => {
    it('빈 기록에서 빈 배열 반환', () => {
      expect(record.getAllRecords()).toEqual([]);
    });

    it('모든 기록을 반환', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.MUL, '5', '20'));
      const all = record.getAllRecords();
      expect(all.length).toBe(2);
    });
  });

  describe('getRecordById', () => {
    it('ID로 기록 조회', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      const found = record.getRecordById(1);
      expect(found.calculationResult.resultNumber).toBe('3');
      expect(found.calculationResult.operator).toBe(Operator.ADD);
    });

    it('존재하지 않는 ID 조회 시 에러', () => {
      expect(() => record.getRecordById(999)).toThrow();
    });
  });

  describe('getRecordByIndex', () => {
    it('유효한 인덱스로 기록 조회', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      const found = record.getRecordByIndex(0);
      expect(found.calculationResult.resultNumber).toBe('3');
    });

    it('음수 인덱스 조회 시 에러', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      expect(() => record.getRecordByIndex(-1)).toThrow();
    });

    it('범위 초과 인덱스 조회 시 에러', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      expect(() => record.getRecordByIndex(5)).toThrow();
    });
  });

  describe('setMemo / getMemo', () => {
    it('메모 설정 및 조회', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.setMemo(1, '테스트 메모');
      expect(record.getMemo(1)).toBe('테스트 메모');
    });

    it('메모가 없으면 null 반환', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      expect(record.getMemo(1)).toBeNull();
    });

    it('존재하지 않는 ID에 메모 설정 시 에러', () => {
      expect(() => record.setMemo(999, '메모')).toThrow();
    });

    it('존재하지 않는 ID의 메모 조회 시 에러', () => {
      expect(() => record.getMemo(999)).toThrow();
    });
  });

  describe('deleteMemo', () => {
    it('메모 삭제', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.setMemo(1, '메모');
      record.deleteMemo(1);
      expect(record.getMemo(1)).toBeNull();
    });
  });

  describe('removeFirst', () => {
    it('가장 최근 기록 제거 (배열 앞)', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      record.removeFirst();
      expect(record.getCount()).toBe(1);
      expect(record.getAllRecords()[0]!.calculationResult.previousNumber).toBe('1');
    });

    it('빈 기록에서 removeFirst 호출해도 에러 없음', () => {
      expect(() => record.removeFirst()).not.toThrow();
    });
  });

  describe('findIndexById', () => {
    it('존재하는 ID의 인덱스 반환', () => {
      record.addRecord(makeResult('1', Operator.ADD, '2', '3'));
      record.addRecord(makeResult('4', Operator.SUB, '1', '3'));
      expect(record.findIndexById(1)).toBe(1);
      expect(record.findIndexById(2)).toBe(0);
    });

    it('존재하지 않는 ID 검색 시 에러', () => {
      expect(() => record.findIndexById(999)).toThrow();
    });
  });
});
