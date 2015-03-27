using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using LightSwitchApplication.Helper;
using Microsoft.LightSwitch;
using Microsoft.LightSwitch.Security.Server;
namespace LightSwitchApplication
{
    public partial class ApplicationDataService
    {
        IEnumerable<int> ParseParaInt(string queryStr)
        {
            if (!string.IsNullOrWhiteSpace(queryStr))
            {
                string[] queryIDs = queryStr.Split(new[] { ',' });
                var orgSearchIDs = new HashSet<int>();
                foreach (var item in queryIDs)
                {
                    if (string.IsNullOrEmpty(item)) continue;
                    orgSearchIDs.Add(int.Parse(item));
                }

                return orgSearchIDs;
            }
            return null;
        }

        IEnumerable<string> ParseParaStr(string queryStr)
        {
            if (!string.IsNullOrWhiteSpace(queryStr))
            {
                string[] queryIDs = queryStr.Split(new[] { ',' });
                var orgSearchIDs = new HashSet<string>();
                foreach (var item in queryIDs)
                {
                    if (string.IsNullOrEmpty(item)) continue;
                    orgSearchIDs.Add(item);
                }

                return orgSearchIDs;
            }
            return null;
        }

        //IEnumerable<T> ParsePara<T>(string queryStr)
        //{
        //    if (!string.IsNullOrWhiteSpace(queryStr))
        //    {
        //        string[] queryIDs = queryStr.Split(new[] { ',' });
        //        var orgSearchIDs = new HashSet<T>();
        //        foreach (var item in queryIDs)
        //        {
        //            if (string.IsNullOrEmpty(item)) continue;
        //            orgSearchIDs.Add((T)Convert.ChangeType(item, typeof(T)));
        //        }

        //        return orgSearchIDs;
        //    }
        //    return null;
        //}

        partial void StadiumQuery_PreprocessQuery(string placePara, string streetPara, string ownerPara, string catePara, string openPara, string recievePara, string operModePara, ref IQueryable<Stadium> query)
        {
            var place = ParseParaStr(placePara);
            if (place != null)
            {
                query = query.Where(e => place.Contains(e.StadiumBase.Place));
            }
            var street = ParseParaInt(streetPara);
            if (street != null)
            {
                query = query.Where(e => street.Contains(e.Street.Id));
            }
            var owner = ParseParaInt(ownerPara);
            if (owner != null)
            {
                query = query.Where(e => e.Owner2StadiumMediatorCollection.Any(o => owner.Contains(o.Owner.Id)));
            }
            var cate = ParseParaInt(catePara);
            if (cate != null)
            {
                query = query.Where(e => cate.Contains(e.Category.Id));
            }
            var open = ParseParaStr(openPara);
            if (open != null)
            {
                query = query.Where(e => e.EcoStatusCollection.Any(eco => open.Contains(eco.OpenStatus)));
            }
            var recv = ParseParaStr(recievePara);
            if (recv != null)
            {
                query = query.Where(e => e.EcoStatusCollection.Any(eco => recv.Contains(eco.ClientCount)));
            }
            var operMode = ParseParaStr(operModePara);
            if (operMode != null)
            {
                query = query.Where(e => e.EcoStatusCollection.Any(eco => operMode.Contains(eco.OperateMode)));
            }
            if (place == null && street == null && owner == null && cate == null && open == null && recv == null &&
                operMode == null)
            {
                query = query.Where(item => false);
            }
        }

        partial void Owner2StaduimQuery_PreprocessQuery(string stadiumIds, ref IQueryable<Owner2StadiumMediator> query)
        {
            var idsAry = ParseParaInt(stadiumIds);
            query = idsAry != null ? query.Where(e => idsAry.Contains(e.Stadium.Id)) : query.Where(e => false);
        }
        
        partial void EcoStatusQuery_PreprocessQuery(string stadiumIds, ref IQueryable<EcoStatus> query)
        {
            var idsAry = ParseParaInt(stadiumIds);
            query = idsAry != null ? query.Where(e => idsAry.Contains(e.StadiumEco.Id)) : query.Where(e => false);
        }

        partial void StadiumQueryByIds_PreprocessQuery(string stadiumIds, ref IQueryable<Stadium> query)
        {
            var idsAry = ParseParaInt(stadiumIds);
            query = idsAry != null ? query.Where(e => idsAry.Contains(e.Id)) : query.Where(e => false);
        }

        partial void JqgridColConfQuery_PreprocessQuery(string permissionStrs, ref IQueryable<JqGridConfig> query)
        {
            var permissionAry = ParseParaStr(permissionStrs);
            query = permissionAry != null
                ? query.Where(e => permissionAry.Any(per => e.Permission.Contains(per)))
                : query.Where(e => false);
        }

        //自动录入数据使用
        partial void DummyTableSet_Inserting(DummyTable entity)
        {
            try
            {
                ExcelReader xlsReader = new ExcelReader(@"E:\My Doc\洪山\洪山区有坐标表格\卓刀泉街.xls");
                xlsReader.Initial();
                var readedDtTable = xlsReader.Xls2DataTables();
                //var sportsTypeTB = xlsReader.Xls2DtTable(0, "场地代码");
                var dataCreator = new DataCreator(this.DataWorkspace);
                dataCreator.CreateStadium(readedDtTable, "卓刀泉街");
                //dataCreator.InsertSiteCategory(sportsTypeTB);//创建场地类型
                //dataCreator.CreateJqGridConf(sportsTypeTB);//创建jqgrid配置文件
            }
            catch (Exception exception)
            {
                var ex = exception.Message;
                //throw;
            }

        }
    }
}
