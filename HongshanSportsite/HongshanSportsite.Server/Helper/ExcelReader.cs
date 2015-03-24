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

        /// <summary>
        /// 将excel中的数据导入到DataTable中
        /// </summary>
        /// <param name="sheetName">excel工作薄sheet的名称</param>
        /// <param name="isFirstRowColumn">第一行是否是DataTable的列名</param>
        /// <returns>返回的DataTable</returns>
        public DataTable ExcelToDataTable(string sheetName, bool isFirstRowColumn)
        {
            ISheet sheet = null;
            DataTable data = new DataTable();
            int startRow = 5;
            try
            {
                fs = new FileStream(fileName, FileMode.Open, FileAccess.Read);
                if (fileName.IndexOf(".xlsx") > 0) // 2007版本
                    workbook = new XSSFWorkbook(fs);
                else if (fileName.IndexOf(".xls") > 0) // 2003版本
                    workbook = new HSSFWorkbook(fs);
                //遍历xls中所有的sheet页
                for (var i = 0; i < workbook.NumberOfSheets; i++)
                {
                    ISheet pSheet = workbook.GetSheetAt(i);
                }
                if (sheetName != null)
                {
                    sheet = workbook.GetSheet(sheetName);
                    if (sheet == null) //如果没有找到指定的sheetName对应的sheet，则尝试获取第一个sheet
                    {
                        sheet = workbook.GetSheetAt(0);
                    }
                }
                else
                {
                    sheet = workbook.GetSheetAt(0);
                }
                if (sheet != null)
                {
                    IRow firstRow = sheet.GetRow(5);
                    int cellCount = firstRow.LastCellNum; //一行最后一个cell的编号 即总的列数

                    if (isFirstRowColumn)
                    {
                        for (int i = firstRow.FirstCellNum; i < cellCount; ++i)
                        {
                            ICell cell = firstRow.GetCell(i);
                            if (cell != null)
                            {
                                string cellValue = cell.StringCellValue;
                                if (cellValue != null)
                                {
                                    DataColumn column = new DataColumn(cellValue);
                                    data.Columns.Add(column);
                                }
                            }
                        }
                        //startRow = sheet.FirstRowNum + 1;
                    }
                    else
                    {
                        //startRow = sheet.FirstRowNum;
                    }

                    //最后一列的标号
                    int rowCount = sheet.LastRowNum;
                    for (int i = startRow; i <= rowCount; ++i)
                    {
                        IRow row = sheet.GetRow(i);
                        if (row == null) continue; //没有数据的行默认是null　　　　　　　

                        DataRow dataRow = data.NewRow();
                        for (int j = row.FirstCellNum; j < cellCount; ++j)
                        {
                            if (row.GetCell(j) != null) //同理，没有数据的单元格都默认是null
                                dataRow[j] = row.GetCell(j).ToString();
                        }
                        data.Rows.Add(dataRow);
                    }
                }

                return data;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.Message);
                return null;
            }
        }

        public IList<DataTable> Xls2DataTables()
        {
            //IWorkbook pWorkbook = null;
            IList<DataTable> pDataTables = new List<DataTable>();
            try
            {
                fs = new FileStream(this.fileName, FileMode.Open, FileAccess.Read);
                if (fileName.IndexOf(".xlsx") > 0)
                {
                    workbook = new XSSFWorkbook(fs);
                }
                else if (fileName.IndexOf(".xls") > 0)
                {
                    workbook = new HSSFWorkbook(fs);
                }
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
            catch (Exception)
            {
                throw;
            }
        }

        private DataTable Xls2DtTable(int startRow, string sheetName)
        {
            ISheet pSheet = null;
            DataTable pDataTable = new DataTable(sheetName);
            try
            {
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
            catch (Exception)
            {
                throw;
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
