using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace LightSwitchApplication.handlers
{
    /// <summary>
    /// GetUserPermissions 的摘要说明
    /// </summary>
    public class GetUserPermissions : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            using (var serverContext = ServerApplicationContext.CreateContext())
            {
                try
                {
                    context.Response.ContentType = "text/plain";
                    string permissions = GetPermissionString(serverContext.Application.User.EffectivePermissions);
                    //permissions += ';'+serverContext.Application.User.FullName;
                    context.Response.Write(permissions);
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private string GetPermissionString(IEnumerable<string> effectivePermissions)
        {
            var permissionStr = new StringBuilder();
            foreach (var nextItem in effectivePermissions)
            {
                permissionStr.Append(GetPurePermissionStr(nextItem) + ",");
            }
            return permissionStr.ToString().TrimEnd(new[] { ',' });
        }

        /// <summary>
        /// 拿到的文件名为lightswitch：...，去掉前面的lightswitch
        /// </summary>
        /// <param name="fullString"></param>
        /// <returns></returns>
        private string GetPurePermissionStr(string fullString)
        {
            var splitedStr = fullString.Split(new[] { ':' });
            return splitedStr[1];
        }

    }
}