using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.LightSwitch;
using Microsoft.LightSwitch.Security.Server;
namespace LightSwitchApplication
{
    public partial class WCF_RIA_ServiceDataService
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

        IEnumerable<int?> ParseParaNullableInt(string queryStr)
        {
            if (!string.IsNullOrWhiteSpace(queryStr))
            {
                string[] queryIDs = queryStr.Split(new[] { ',' });
                var orgSearchIDs = new HashSet<int?>();
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

        partial void CombindedStadiumQuery_PreprocessQuery(string placePara, string streetPara, string ownerPara, string catePara, string openPara, string recievePara, string operModePara, ref IQueryable<CombinedStadiumItem> query)
        {
            var place = ParseParaStr(placePara);
            if (place != null)
            {
                query = query.Where(e => place.Contains(e.Place));
            }
            //var street = ParseParaStr(streetPara);
            var street = ParseParaNullableInt(streetPara);
            if (street != null)
            {
                query = query.Where(e => street.Contains(e.StreetId));
            }
            //var owner = ParseParaInt(ownerPara);
            //if (owner != null)
            //{
            //    query = query.Where(e => e.StadiumEco.Owner2StadiumMediatorCollection.Any(o => owner.Contains(o.Owner.Id)));
            //}
            var owner = ParseParaStr(ownerPara);
            if (owner != null)
            {
                //query = query.Where(e => e.StadiumEco.Owner2StadiumMediatorCollection.Any(o => owner.Contains(o.Owner.Id)));
                query = query.Where(e => owner.All(o => e.Owner.Contains(o)));
            }

            var cate = ParseParaNullableInt(catePara);
            if (cate != null)
            {
                query = query.Where(e => cate.Contains(e.CateId));
            }
            var open = ParseParaStr(openPara);
            if (open != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => open.Contains(eco.OpenStatus)));
                query = query.Where(e => e.EcoStatus.Any(eco => open.Contains(eco.OpenStatus)));
            }
            var recv = ParseParaStr(recievePara);
            if (recv != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => recv.Contains(eco.ClientCount)));
                query = query.Where(e => e.EcoStatus.Any(eco => recv.Contains(eco.ClientCount)));
            }
            var operMode = ParseParaStr(operModePara);
            if (operMode != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => operMode.Contains(eco.OperateMode)));
                query = query.Where(e => e.EcoStatus.Any(eco => operMode.Contains(eco.OperateMode)));
            }
            if (place == null && street == null && owner == null && cate == null && open == null && recv == null &&
                operMode == null)
            {
                query = query.Where(item => false);
            }
        }

        partial void RiaEcostatusQuery_PreprocessQuery(string placePara, string streetPara, string ownerPara, string catePara, string openPara, string recievePara, string operModePara, ref IQueryable<CombindeEcoStatusItem> query)
        {
            var place = ParseParaStr(placePara);
            if (place != null)
            {
                query = query.Where(e => place.Contains(e.PlaceStrs));
                //query = query.Where(e => place.Contains(e.));
            }
            var street = ParseParaNullableInt(streetPara);
            if (street != null)
            {
                //query = query.Where(e => street.Contains(e.Stadium.Street));
                query = query.Where(e => street.Contains(e.StreetId));
            }
            var owner = ParseParaStr(ownerPara);
            if (owner != null)
            {
                //query = query.Where(e => e.StadiumEco.Owner2StadiumMediatorCollection.Any(o => owner.Contains(o.Owner.Id)));
                query = query.Where(e => owner.All(o => e.OwnerStrs.Contains(o)));
            }
            var cate = ParseParaNullableInt(catePara);
            if (cate != null)
            {
                query = query.Where(e => cate.Contains(e.CateId));
            }
            var open = ParseParaStr(openPara);
            if (open != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => open.Contains(eco.OpenStatus)));
                query = query.Where(e => open.Contains(e.OpenStatus));
            }
            var recv = ParseParaStr(recievePara);
            if (recv != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => recv.Contains(eco.ClientCount)));
                query = query.Where(e => recv.Contains(e.ClientCount));
            }
            var operMode = ParseParaStr(operModePara);
            if (operMode != null)
            {
                //query = query.Where(e => e.StadiumEco.EcoStatusCollection.Any(eco => operMode.Contains(eco.OperateMode)));
                query = query.Where(e => operMode.Contains(e.OperateMode));
            }
            if (place == null && street == null && owner == null && cate == null && open == null && recv == null &&
                operMode == null)
            {
                query = query.Where(item => false);
            }
            query.OrderBy(e => e.Stadium.SiteId);
        }
    }
}
