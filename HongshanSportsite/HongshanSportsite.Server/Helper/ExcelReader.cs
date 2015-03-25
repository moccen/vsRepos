using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NPOI.SS.UserModel;
using NPOI.HSSF.UserModel;
using NPOI.XSSF.UserModel;

namespace LightSwitchApplication.Helper
{
    public class ExcelReader : IDisposable
    {
        private string fileName = null; //文件名
        private IWorkbook workbook = null;
        private FileStream fs = null;
        private bool disposed;

        public ExcelReader(string fileName)
        {
            this.fileName = fileName;
            disposed = false;
        }

        public void Initial()
        {
            try
            {
                fs = new FileStream(fileName, FileMode.Open, FileAccess.Read);
                if (fileName.ToLower().Contains(".xlsx"))
                {
                    workbook = new XSSFWorkbook(fs);
                }
                else if (fileName.ToLower().Contains(".xls"))
                {
                    workbook = new HSSFWorkbook(fs);
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        public IList<DataTable> Xls2DataTables()
        {
            //IWorkbook pWorkbook = null;
            IList<DataTable> pDataTables = new List<DataTable>();
            try
            {
                for (int i = 0; i < workbook.NumberOfSheets; i++)
                {
                    var pSheet = workbook.GetSheetAt(i);
                    var headerRow = pSheet.GetRow(5);
                    DataTable dataTable = null;
                    //有点表指标序号在第六行，有的表在第七行
                    if (headerRow.GetCell(0).StringCellValue == "指标序号")
                    {
                        dataTable = Xls2DtTable(5, pSheet.SheetName);
                    }
                    else
                    {
                        dataTable = Xls2DtTable(6, pSheet.SheetName);
                    }
                    if (dataTable != null)
                    {
                        pDataTables.Add(dataTable);
                    }
                }
                return pDataTables;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public DataTable Xls2DtTable(int startRow, string sheetName)
        {
            ISheet pSheet = null;
            DataTable pDataTable = new DataTable(sheetName);
            try
            {
                if (workbook != null)
                    pSheet = workbook.GetSheet(sheetName);//获取当前的sheet页
                if (pSheet != null)
                {
                    var headerRow = pSheet.GetRow(startRow);
                    int cellCount = headerRow.LastCellNum;//拿到第一行的列数
                    //为datatable创建列
                    for (int i = headerRow.FirstCellNum; i < cellCount; i++)
                    {
                        ICell cell = headerRow.GetCell(i);
                        if (cell != null)
                        {
                            string cellValue = cell.StringCellValue;
                            if (cellValue != null)
                            {
                                var column = new DataColumn(cellValue);
                                pDataTable.Columns.Add(column);
                            }
                        }
                    }
                    //向datatable中添加行数据
                    int rowCount = pSheet.LastRowNum;
                    for (int i = startRow + 1; i < rowCount; i++)
                    {
                        var row = pSheet.GetRow(i);
                        if (row == null)
                        {
                            continue;
                        }
                        DataRow dataRow = pDataTable.NewRow();
                        for (int j = row.FirstCellNum; j < cellCount; j++)
                        {
                            if (row.GetCell(j) != null)
                            {
                                dataRow[j] = row.GetCell(j).ToString();
                            }
                        }
                        pDataTable.Rows.Add(dataRow);
                    }
                }
                return pDataTable;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    if (fs != null)
                        fs.Close();
                }

                fs = null;
                disposed = true;
            }
        }
    }
}
