// HTML elements
// const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;

const tableDataRows = document.querySelectorAll<HTMLTableRowElement>('.data-row');
tableDataRows.forEach(dataRow => {
   dataRow.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.matches('i.delete')) {
         deleteDataRow(dataRow);
      } else if (target.matches('i.edit')) {
         editDataRow(dataRow);
      }
   });
});

function deleteDataRow(dataRow: HTMLTableRowElement) {
   dataRow.remove();
}
function editDataRow(dataRow: HTMLTableRowElement) {
   for (let i = 0; i < dataRow['children'].length; i++) {
      dataRow['children'][i].toggleAttribute('contenteditable');
   }
}
